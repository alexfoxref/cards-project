import {
  useContext,
  useChildren,
  useReducer,
  useValue,
  getValue,
  useMemo,
} from '../Core'
import utils from '../utils'

export const contextGenerator = (Context, store) => {
  const { reducer, actions } = store
  const initialState = store.initialState ?? {}

  if (!utils.isFunction(reducer)) {
    throw new Error(
      `Bad usage of reducer. Type of reducer must be a 'function'.`
    )
  }

  const useCtx = () => {
    return useContext(Context)
  }

  const CtxProvider = ({ value }) => {
    const initialValue = useMemo(
      () => (value ? getValue(value) : initialState),
      []
    )
    const [state, dispatch] = useReducer(reducer, initialValue)
    const providerActions = useMemo(() => {
      return Object.keys(actions).reduce((acc, key) => {
        return { ...acc, [key]: (...args) => actions[key](dispatch, ...args) }
      }, {})
    }, [actions, dispatch])

    const contextValue = useMemo(() => ({ ...state, ...providerActions }), [
      state,
      providerActions,
    ])

    return `
            <${Context} value="${useValue(contextValue)}">
                ${useChildren(children => children)}
            </ ${Context}>
        `
  }

  return [useCtx, CtxProvider]
}
