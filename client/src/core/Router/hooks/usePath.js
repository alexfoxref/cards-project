import { getValue, useMemo } from '../../Core'
import utils from '../../utils'
import { constants } from '../config'

export const usePath = to => {
  const initialState = useMemo(
    () => ({
      state: null,
      title: null,
      url: window.location,
    }),
    []
  )

  const value = useMemo(() => getValue(to), [to])
  const state = useMemo(
    () =>
      utils.isString(value)
        ? { ...initialState, url: value }
        : { ...initialState, ...value },
    [initialState, value]
  )

  const url = useMemo(() => new URL(state.url, constants.BASE), [
    state.url,
    constants.BASE,
  ])

  if (
    url.origin !== constants.BASE ||
    /^(www\.)?([^\.]+\.)+[^\.]+/.test(url.pathname)
  ) {
    throw new Error(
      `Only relative paths are allowed in prop 'to' of Link or Redirect components.`
    )
  }

  state.url = useMemo(() => url.href, [url.href])

  return [url, state]
}
