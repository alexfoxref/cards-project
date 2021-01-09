import { getValue, useArray, useCallback, useValue } from '../../core/Core'
import { useAppStore } from '../../hooks'
import utils from '../../core/utils'
import './style.scss'

export const NavBar = ({ links = useValue([]), onLogoClick = null }) => {
  const { logout } = useAppStore()
  const {
    auth: { isAuthenticated },
    message,
  } = useAppStore()

  const logoutHandler = useCallback(event => {
    event.preventDefault()
    logout()
    message('Вы вышли из системы.')
  }, [])

  return `
    <nav>
      <div class="nav-wrapper light-blue darken-2">
        <a 
          class="logo" 
          href="#"
          ${onLogoClick ? `onclick="${onLogoClick}"` : ''}
        >Карточки</a>
        <ul id="nav-mobile" class="right hide-on-med-and-down">
          ${useArray(
            getValue(links).map(
              link => `
                <li key="${link.id}">
                  <Link to="${link.to}">
                    ${link.title}
                  </Link>
                </li>
              `
            )
          )}
          ${
            utils.normalizeValue(isAuthenticated)
              ? `
                <li><a href="#" onclick="${useValue(
                  logoutHandler
                )}">Выйти</a></li>
              `
              : ''
          }
        </ul>
      </div>
    </nav>
  `
}
