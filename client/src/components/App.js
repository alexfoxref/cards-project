import { useEffect } from '../core/Core'
import { useRoutes } from '../routes'
import { useAppStore } from '../hooks'

export const App = () => {
  const {
    auth: { isAuthenticated },
    request: { error: requestError },
    errorMessage,
    authInit,
    clearError,
  } = useAppStore()
  const routes = useRoutes(isAuthenticated)

  useEffect(() => {
    errorMessage(requestError)
    clearError()
  }, [requestError, clearError])

  useEffect(() => {
    authInit()
  }, [])

  return `
    <div>
      <Header isAuthenticated="${isAuthenticated}"/>
      ${routes}
    </div>
  `
}
