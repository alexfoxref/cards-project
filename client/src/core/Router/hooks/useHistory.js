import { useRouter } from '../components'
import routerActions from '../routerActions'
import { usePath } from './usePath'

export const useHistory = () => {
  const { dispatch } = useRouter()

  return {
    ...window.history,
    push: to => {
      const [url, state] = usePath(to)

      routerActions.push(state)
      routerActions.setLocation(dispatch, url, state.state)
    },
    replace: to => {
      const [url, state] = usePath(to)

      routerActions.replace(state)
      routerActions.setLocation(dispatch, url, state.state)
    },
  }
}
