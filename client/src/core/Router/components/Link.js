import { useRouter } from './RouterContext'
import { useCallback, useChildren, useValue } from '../../Core'
import routerActions from '../routerActions'
import { usePath } from '../hooks'

const Link = ({ to }) => {
  const [url, state] = usePath(to)
  const { dispatch } = useRouter()
  const handleOnclick = useCallback(
    event => {
      event.preventDefault()
      // console.log('click link to', url.href)

      routerActions.push(state)
      routerActions.setLocation(dispatch, url, state.state)
    },
    [url.href]
  )

  return `
      <a href="${url}" onclick="${useValue(handleOnclick)}">
          ${useChildren(children => children)}
      </a>
    `
}

export default Link
