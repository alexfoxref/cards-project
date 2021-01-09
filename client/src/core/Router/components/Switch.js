import { useRouter } from './RouterContext'
import { useChildren, useEffect, useMemo } from '../../Core'
import routerActions from '../routerActions'

const Switch = ({ children }) => {
  const {
    location,
    dispatch,
    match,
    withSwitch,
    initializedLocation,
  } = useRouter()

  withSwitch.current = true

  const currentMatch = useMemo(
    () => routerActions.getMatch(location, children),
    [location, children]
  )

  useEffect(() => {
    if (initializedLocation.current) {
      routerActions.setMatch(dispatch, currentMatch)
    }
  }, [currentMatch, dispatch, initializedLocation.current])

  return `${useChildren(children => children)}`
}

export default Switch
