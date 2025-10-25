export async function initialize(): Promise<void> {
  try {
    await window.api.settings.init()
  } catch (e) {
    console.error("settings.initialize failed", e)
  }
}

export async function get<T = unknown>(key: string): Promise<T | null> {
  try {
    const raw = await window.api.settings.get(key)
    if (raw == null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return (raw as unknown) as T
    }
  } catch (e) {
    console.error("settings.get failed", e)
    return null
  }
}

export async function set<T = unknown>(key: string, value: T): Promise<void> {
  try {
    const val = typeof value === "string" ? value : JSON.stringify(value)
    await window.api.settings.set(key, val)
  } catch (e) {
    console.error("settings.set failed", e)
  }
}

export async function getAll(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {}
  try {
    const rows = await window.api.settings.getAll()
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
