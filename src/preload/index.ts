import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  query: (sql: string, params: any[]) => ipcRenderer.invoke('db:query', sql, params),
  marks: {
    init: () => ipcRenderer.invoke('marks:init') as Promise<boolean>,
    list: (filter?: { type?: string; hizb?: number; quarter?: number; groupId?: string }) => ipcRenderer.invoke('marks:list', filter) as Promise<any[]>,
    create: (payload: {
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
    }) => ipcRenderer.invoke('marks:create', payload) as Promise<{ id: string; createdAt: number }>,
    update: (id: string, patch: Partial<{
      type: 'note'|'mistake'|'mutashabih'
      hizb: number
      quarter: number
      start: { rowId: number; offset: number }
      end: { rowId: number; offset: number }
      color: string | null
      note: string | null
      groupId: string | null
      excerpt: string | null
    }>) => ipcRenderer.invoke('marks:update', id, patch) as Promise<{ changes: number }>,
    delete: (id: string) => ipcRenderer.invoke('marks:delete', id) as Promise<{ changes: number }>
  },
  groups: {
    list: () => ipcRenderer.invoke('marks:groups:list') as Promise<any[]>,
    create: (payload: { id?: string; color: string; label?: string|null }) => ipcRenderer.invoke('marks:groups:create', payload) as Promise<{ id: string; createdAt: number; changes: number }>,
    update: (id: string, patch: { color?: string; label?: string|null }) => ipcRenderer.invoke('marks:groups:update', id, patch) as Promise<{ changes: number }>,
    delete: (id: string) => ipcRenderer.invoke('marks:groups:delete', id) as Promise<{ changes: number }>
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
