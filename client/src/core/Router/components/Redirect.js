import { useMemo, useEffect } from '../../Core'
import { usePath } from '../hooks'
import routerActions from '../routerActions'
import { useRouter } from './RouterContext'

const Redirect = ({ to }) => {
  const [url, state] = usePath(to)
  const { location, dispatch, match } = useRouter()
  const isVisible = useMemo(() => match.pattern === '*', [match.pattern])

  useEffect(() => {
    if (isVisible && url.pathname !== location.pathname) {
      routerActions.replace(state)
      routerActions.setLocation(dispatch, url, state.state)
    }
  }, [isVisible, url, location, state, dispatch])

  return ''
}

export default Redirect
