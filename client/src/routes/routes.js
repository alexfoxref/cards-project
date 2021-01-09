import { config } from '../config'
import { useMemo } from '../core/Core'
import { useAppStore } from '../hooks'

export const useRoutes = () => {
  const {
    auth: { isAuthenticated },
  } = useAppStore()

  return useMemo(() => {
    return isAuthenticated
      ? `
        <Switch>
          <Route 
            exact 
            path="/"
            title="Главная"
            component="MainPage"
          />
          <Route 
            exact 
            path="/profile"
            title="Профиль"
            component="ProfilePage" 
          />
          <Route 
            path="/card/:id"
            title="Карточки"
            component="CardPage" 
          />
          <Route 
            path="/edit/:id"
            title="Редактирование"
            component="EditPage" 
          />
          <Redirect 
            to="/"
          />
        </Switch>
      `
      : `
        <Switch>
          <Route 
            exact
            path="/auth/login"
            title="Авторизация"
          >
            <AuthPage page="${config.pages.login}"/>
          </Route>
          <Route 
            exact
            path="/auth/register"
            title="Регистрация"
          >
            <AuthPage page="${config.pages.register}"/>
          </Route>
          <Redirect 
            to="/auth/login" 
          />
        </Switch>
      `
  }, [isAuthenticated])
}
