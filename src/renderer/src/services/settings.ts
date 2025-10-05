export async function initialize(): Promise<void> {
  try {
    await window.api.query(
      "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
      [],
    )
  } catch (e) {
    console.error("settings.initialize failed", e)
  }
}

export async function get<T = unknown>(key: string): Promise<T | null> {
  try {
    const rows = await window.api.query("SELECT value FROM settings WHERE key = ?", [key])
    if (rows && rows.length > 0) {
      const raw = rows[0].value as string
      try {
        return JSON.parse(raw) as T
      } catch {
        return (raw as unknown) as T
      }
    }
    return null
  } catch (e) {
    console.error("settings.get failed", e)
    return null
  }
}

export async function set<T = unknown>(key: string, value: T): Promise<void> {
  try {
    const val = typeof value === "string" ? value : JSON.stringify(value)
    await window.api.query(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, val],
    )
  } catch (e) {
    console.error("settings.set failed", e)
  }
}

export async function getAll(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {}
  try {
    const rows = await window.api.query("SELECT key, value FROM settings", [])
    for (const r of rows) {
      try {
        out[r.key] = JSON.parse(r.value)
      } catch {
        out[r.key] = r.value
      }
    }
  } catch (e) {
    console.error("settings.getAll failed", e)
  }
  return out
}
