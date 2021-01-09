import { useCallback, useEffect, useState, useValue } from '../core/Core'
import { useHistory, useMatch } from '../core/Router'

export const ProfilePage = () => {
  const { push } = useHistory()
  const { query } = useMatch()
  const [tab, setTab] = useState(query.tab ?? 'all')

  useEffect(() => {
    setTab(query.tab)
  }, [query])

  const clickHandler = useCallback(event => {
    setTab(event.target.name)
    if (query.tab !== event.target.name) {
      push(`/profile?tab=${event.target.name}`)
    }
  }, [])

  return `
    <div class="container">
      <div class="row">
        <div class="col s12">
          <ul class="tabs profile-tabs">
            <li class="tab col s6${tab !== 'create' ? ` active` : ''}">
              <a 
                name="all"
                class="black-text" 
                onclick="${useValue(clickHandler)}"
              >Мои карточки</a>
            </li>
            <li class="tab col s6${tab === 'create' ? ` active` : ''}">
              <a 
                name="create"
                class="black-text"
                onclick="${useValue(clickHandler)}"
              >Создать новую карточку</a>
            </li>
            <div class="indicator${
              tab === 'create' ? ' indicator-right' : ' indicator-left'
            }" />
          </ul>
        </div>
        <div id="all" class="col s12">
          ${
            tab === 'create'
              ? `<CardCreate />`
              : `<CardList own="${useValue(true)}"/>`
          }
        </div>
      </div>
    </div>
  `
}
