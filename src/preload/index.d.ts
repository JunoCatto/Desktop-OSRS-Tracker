import { HiscoreData } from '../renderer/src/types'
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchHiscores: (username: string) => Promise<HiscoreData>
    }
  }
}
