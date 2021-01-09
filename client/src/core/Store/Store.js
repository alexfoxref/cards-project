import { createContext, useComponent, useValue } from '../Core'
import { contextGenerator } from './contextGenerator'
import utils from '../utils'

export default class Store {
  constructor({ initialState, reducer, actions }) {
    this.initialState = initialState
    this.reducer = reducer
    this.actions = actions
  }

  listen = App => {
    if (!utils.isString(App)) {
      throw new Error(
        `Bad usage of Store.listen. Store.listen prop must be a 'string'.`
      )
    }

    const Context = createContext(this.initialState)
    const [useCtx, CtxProvider] = contextGenerator(Context, {
      initialState: this.initialState,
      reducer: this.reducer,
      actions: this.actions,
    })

    this.useCtx = useCtx

    useComponent({ CtxProvider })

    return `
      <CtxProvider value="${useValue(this.initialState)}">
        <${App} />
      </CtxProvider>
    `
  }
}
