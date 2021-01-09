import { createContext, useChildren, useContext } from '../../Core'
import { useComponent } from '../../Core'

const RouterContext = createContext()

export const useRouter = () => {
  return useContext(RouterContext)
}

const RouterProvider = ({ value }) => {
  return `
      <${RouterContext} value="${value}">
        ${useChildren(children => children)}
      </${RouterContext}>
    `
}

useComponent({ RouterProvider })

export default RouterProvider
