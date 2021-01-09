import { useMemo } from '../index'

const useCallback = (callback, dependencies) => {
  return useMemo(() => callback, dependencies)
}

export default useCallback
