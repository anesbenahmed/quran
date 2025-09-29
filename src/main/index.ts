import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

const dbPath = is.dev
  ? join(app.getAppPath(), 'resources/database/quran.db')
  : join(process.resourcesPath, 'app.asar.unpacked/resources/database/quran.db')

const db = new Database(dbPath)

// Writable annotations database (initialized on demand in userData)
let marksDb: Database | null = null

function ensureMarksDb(): Database {
  if (marksDb) return marksDb
  const marksDbPath = join(app.getPath('userData'), 'marks.db')
  const mdb = new Database(marksDbPath)
  try {
    mdb.pragma('journal_mode = WAL')
    mdb.pragma('foreign_keys = ON')
    mdb.exec(`
      CREATE TABLE IF NOT EXISTS annotation_groups (
        id TEXT PRIMARY KEY,
        color TEXT NOT NULL,
        label TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('note','mistake','mutashabih')),
        hizb INTEGER NOT NULL,
        quarter INTEGER NOT NULL,
        start_row_id INTEGER NOT NULL,
        start_offset INTEGER NOT NULL,
        end_row_id INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        color TEXT,
        note TEXT,
        group_id TEXT,
        excerpt TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(group_id) REFERENCES annotation_groups(id) ON DELETE SET NULL
      );
      CREATE INDEX IF NOT EXISTS idx_annotations_hizb_quarter ON annotations(hizb, quarter);
      CREATE INDEX IF NOT EXISTS idx_annotations_type ON annotations(type);
      CREATE INDEX IF NOT EXISTS idx_annotations_group ON annotations(group_id);
    `)
  } catch (e) {
    console.error('Failed to init marks DB:', e)
  }
  marksDb = mdb
  return mdb
}



function createWindow(): void {
  // Create the browser window.

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    try { db.close() } catch {}
    try { marksDb?.close() } catch {}
    app.quit()
  }
})

ipcMain.handle('db:query', (_event, sql, params) => {
  try {
    const stmt = db.prepare(sql)
    return stmt.all(params)
  } catch (err) {
    console.error('Database query error:', err)
    throw err // Forward the error to the renderer process
  }
})

// Annotations/Marks IPC API
ipcMain.handle('marks:init', () => {
  ensureMarksDb()
  return true
})

ipcMain.handle('marks:list', (_event, filter?: { type?: string; hizb?: number; quarter?: number; groupId?: string }) => {
  const mdb = ensureMarksDb()
  const where: string[] = []
  const params: any = {}
  if (filter?.type) { where.push('type = @type'); params.type = filter.type }
  if (typeof filter?.hizb === 'number') { where.push('hizb = @hizb'); params.hizb = filter.hizb }
  if (typeof filter?.quarter === 'number') { where.push('quarter = @quarter'); params.quarter = filter.quarter }
  if (filter?.groupId) { where.push('group_id = @groupId'); params.groupId = filter.groupId }
  const sql = `SELECT * FROM annotations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at ASC`
  return mdb.prepare(sql).all(params)
})

ipcMain.handle('marks:create', (
  _event,
  payload: {
    id?: string
    type: 'note'|'mistake'|'mutashabih'
    hizb: number
    quarter: number
    start: { rowId: number; offset: number }
    end: { rowId: number; offset: number }
    color?: string | null
    note?: string | null
    groupId?: string | null
    excerpt?: string | null
  }
) => {
  const mdb = ensureMarksDb()
  const id = payload.id || randomUUID()
  const createdAt = Date.now()
  const stmt = mdb.prepare(`
    INSERT INTO annotations (
      id, type, hizb, quarter,
      start_row_id, start_offset, end_row_id, end_offset,
      color, note, group_id, excerpt, created_at
    ) VALUES (@id, @type, @hizb, @quarter, @start_row_id, @start_offset, @end_row_id, @end_offset, @color, @note, @group_id, @excerpt, @created_at)
  `)
  stmt.run({
    id,
    type: payload.type,
    hizb: payload.hizb,
    quarter: payload.quarter,
    start_row_id: payload.start.rowId,
    start_offset: payload.start.offset,
    end_row_id: payload.end.rowId,
    end_offset: payload.end.offset,
    color: payload.color ?? null,
    note: payload.note ?? null,
    group_id: payload.groupId ?? null,
    excerpt: payload.excerpt ?? null,
    created_at: createdAt,
  })
  return { id, createdAt }
})

ipcMain.handle('marks:update', (
  _event,
  id: string,
  patch: Partial<{
    type: 'note'|'mistake'|'mutashabih'
    hizb: number
    quarter: number
    start: { rowId: number; offset: number }
    end: { rowId: number; offset: number }
    color: string | null
    note: string | null
    groupId: string | null
    excerpt: string | null
  }>
) => {
  const mdb = ensureMarksDb()
  const sets: string[] = []
  const params: any = { id }
  const map: Record<string,string> = {
    type: 'type',
    hizb: 'hizb',
    quarter: 'quarter',
    color: 'color',
    note: 'note',
    groupId: 'group_id',
    excerpt: 'excerpt',
  }
  for (const key of Object.keys(map) as (keyof typeof map)[]) {
    if (key in patch) { sets.push(`${map[key]} = @${map[key]}`); params[map[key]] = (patch as any)[key] }
  }
  if (patch.start) {
    sets.push('start_row_id = @start_row_id', 'start_offset = @start_offset')
    params.start_row_id = patch.start.rowId
    params.start_offset = patch.start.offset
  }
  if (patch.end) {
    sets.push('end_row_id = @end_row_id', 'end_offset = @end_offset')
    params.end_row_id = patch.end.rowId
    params.end_offset = patch.end.offset
  }
  if (sets.length === 0) return { changes: 0 }
  const sql = `UPDATE annotations SET ${sets.join(', ')} WHERE id = @id`
  const info = mdb.prepare(sql).run(params)
  return { changes: info.changes }
})

ipcMain.handle('marks:delete', (_event, id: string) => {
  const mdb = ensureMarksDb()
  const info = mdb.prepare('DELETE FROM annotations WHERE id = ?').run(id)
  return { changes: info.changes }
})

// Groups API
ipcMain.handle('marks:groups:list', () => {
  const mdb = ensureMarksDb()
  return mdb.prepare('SELECT * FROM annotation_groups ORDER BY created_at ASC').all()
})

ipcMain.handle('marks:groups:create', (_event, payload: { id?: string; color: string; label?: string|null }) => {
  const mdb = ensureMarksDb()
  const id = payload.id || randomUUID()
  const createdAt = Date.now()
  const info = mdb.prepare('INSERT INTO annotation_groups (id, color, label, created_at) VALUES (?, ?, ?, ?)').run(
    id,
    payload.color,
    payload.label ?? null,
    createdAt,
  )
  return { id, createdAt, changes: info.changes }
})

ipcMain.handle('marks:groups:update', (_event, id: string, patch: { color?: string; label?: string|null }) => {
  const mdb = ensureMarksDb()
  const sets: string[] = []
  const params: any = { id }
  if (patch.color !== undefined) { sets.push('color = @color'); params.color = patch.color }
  if (patch.label !== undefined) { sets.push('label = @label'); params.label = patch.label }
  if (!sets.length) return { changes: 0 }
  const sql = `UPDATE annotation_groups SET ${sets.join(', ')} WHERE id = @id`
  const info = mdb.prepare(sql).run(params)
  return { changes: info.changes }
})

ipcMain.handle('marks:groups:delete', (_event, id: string) => {
  const mdb = ensureMarksDb()
  const info = mdb.prepare('DELETE FROM annotation_groups WHERE id = ?').run(id)
  // Orphan annotations will keep group_id but FK will set NULL only if using ON DELETE SET NULL and foreign_keys ON.
  return { changes: info.changes }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
