import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      query: (sql: string, params?: any[]) => Promise<any>
      marks: {
        init: () => Promise<boolean>
        list: (filter?: { type?: string; hizb?: number; quarter?: number; groupId?: string }) => Promise<any[]>
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
        }) => Promise<{ id: string; createdAt: number }>
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
        }>) => Promise<{ changes: number }>
        delete: (id: string) => Promise<{ changes: number }>
      }
      settings: {
        init: () => Promise<boolean>
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<{ changes: number }>
        getAll: () => Promise<Array<{ key: string; value: string }>>
      }
      groups: {
        list: () => Promise<any[]>
        create: (payload: { id?: string; color: string; label?: string|null }) => Promise<{ id: string; createdAt: number; changes: number }>
        update: (id: string, patch: { color?: string; label?: string|null }) => Promise<{ changes: number }>
        delete: (id: string) => Promise<{ changes: number }>
        applyColor: (id: string) => Promise<{ changes: number }>
      }
    }  }
}
