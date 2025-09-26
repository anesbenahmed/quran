import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      query: (sql: string, params?: any[]) => Promise<any>
    }  }
}
