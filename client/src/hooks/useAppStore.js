import { useStore } from '../core/Store'
import { store } from '../store'

export const useAppStore = () => {
  return useStore(store)
}
