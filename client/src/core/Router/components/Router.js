import { config, initialState } from '../config'
import routerReducer from '../routerReducer'
import routerActions from '../routerActions'
import {
  useCallback,
  useChildren,
  useEffect,
  useReducer,
  useRef,
  useValue,
} from '../../Core'

const Router = () => {
  const [state, dispatch] = useReducer(routerReducer, initialState)
  const withSwitch = useRef(false)
  const initializedLocation = useRef(false)
  const onPopstate = useCallback(
    event => {
      const url = new URL(event.target.location.href)

      routerActions.setLocation(dispatch, url)
    },
    [dispatch]
  )
  const initLocation = useCallback(() => {
    const url = new URL(window.location.href)

    routerActions.setLocation(dispatch, url)
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', onPopstate)
    initLocation()
    initializedLocation.current = true

    return () => {
      window.removeEventListener('popstate', onPopstate)
    }
  }, [])

  return `
      <RouterProvider value="${useValue({
        ...state,
        dispatch,
        withSwitch,
        initializedLocation,
      })}">
        ${useChildren(children => children)}
      </RouterProvider>
    `
}

export default Router
