import { useEffect } from '../../Core'
import routerActions from '../routerActions'
import { useRouter } from './RouterContext'

const Route = ({ component, children, path, title }) => {
  const { match, withSwitch, location } = useRouter()
  const isVisible = !withSwitch.current ? true : match.pattern === path

  if (!isVisible) return ''

  useEffect(() => {
    if (isVisible) {
      routerActions.setTitle(title)
    }
  }, [title, location.href])

  const renderedComponent = component ? `<${component} />` : children

  return renderedComponent
}

export default Route
