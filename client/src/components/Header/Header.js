import { useCallback, useMemo, useValue } from '../../core/Core'
import { useHistory } from '../../core/Router'
import utils from '../../core/utils'
import { useAppStore } from '../../hooks'

export const Header = () => {
  const history = useHistory()
  const {
    auth: { isAuthenticated },
  } = useAppStore()

  const links = useMemo(() => {
    return utils.normalizeValue(isAuthenticated)
      ? [
          {
            title: 'Карточки',
            to: '/',
            id: utils.uuid(),
          },
          {
            title: 'Профиль',
            to: '/profile',
            id: utils.uuid(),
          },
        ]
      : [
          {
            title: 'Авторизация',
            to: '/auth/login',
            id: utils.uuid(),
          },
          {
            title: 'Регистрация',
            to: '/auth/register',
            id: utils.uuid(),
          },
        ]
  }, [isAuthenticated])

  const onClickHandler = useCallback(
    event => {
      event.preventDefault()

      history.push(isAuthenticated ? '/' : '/auth/login')
    },
    [isAuthenticated]
  )

  return `
    <NavBar 
      links="${useValue(links)}"
      onLogoClick="${useValue(onClickHandler)}"
    />
  `
}
