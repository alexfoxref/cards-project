import { config, constants } from './config'
import utils from '../utils'
import CoreParser from '../Core/CoreParser'

const routerActions = {
  changeHistoryState(state, fn) {
    let newState = state

    if (!utils.isObject(state)) {
      if (utils.isRegExp(state)) {
        newState = { state: null, title: null, url: state.toString() }
      } else if (utils.isString(state)) {
        newState = { state: null, title: null, url: state }
      } else {
        throw new Error(
          `Only 'object', 'string' or 'regexp' types are allowed in 'push' and 'replace' methods.`
        )
      }
    }

    fn(...Object.values(newState))
  },

  push(state = { state: null, title: null, url: window.location }) {
    routerActions.changeHistoryState(state, (...args) =>
      window.history.pushState(...args)
    )
  },

  replace(state = { state: null, title: null, url: window.location }) {
    routerActions.changeHistoryState(state, (...args) =>
      window.history.replaceState(...args)
    )
  },

  setLocation(dispatch, url, state = null) {
    const query = {}

    for (const keyAndVal of url.searchParams.entries()) {
      query[keyAndVal[0]] = keyAndVal[1]
    }
    const { href, pathname, search, searchParams, hash } = url

    dispatch({
      type: constants.SET_LOCATION,
      payload: { href, pathname, search, searchParams, hash, state },
    })
  },

  setTitle(title) {
    if (config.title) {
      if (title) {
        document.title = `${title} ${config.separator ?? ''} ${
          config.baseTitle ?? ''
        }`.trim()
      } else {
        document.title = `${config.baseTitle ?? 'Project'}`
      }
    }
  },

  getMatch(location, children) {
    const arr = children.split('"')
    const source = arr[arr.length - 2].split('_')[0]
    const switchChildren = CoreParser.childrenSources[source]

    const patterns = switchChildren.map(({ props, type }) => {
      const str = type === 'Route' ? props.path ?? '*' : '*'
      const newStr = str.replace(/:([^\/]+)/g, '([^/]+)').replace(/\*$/, '.*')
      const params = {}
      const query = {}
      const hash = null
      const paramsKeys = str.match(/:([^\/]+)/)

      if (paramsKeys) {
        for (let i = 1; i < paramsKeys.length; i++) {
          params[paramsKeys[i]] = null
        }
      }

      return {
        params,
        query,
        hash,
        pattern: str,
        regexp: new RegExp(newStr),
        exact: props.exact,
        title: props.title,
      }
    })

    const completeParams = pattern => {
      const { searchParams } = location

      if (searchParams) {
        for (const p of searchParams) {
          pattern.query[p[0]] = p[1]
        }
      }

      pattern.hash = location.hash

      return pattern
    }

    for (const pattern of patterns) {
      if (utils.normalizeValue(pattern.exact)) {
        if (
          pattern.regexp.toString() === new RegExp(location.pathname).toString()
        ) {
          return completeParams(pattern)
        }
      } else {
        const match = location.pathname.match(pattern.regexp)

        if (match) {
          for (let i = 1; i < match.length; i++) {
            pattern.params[Object.keys(pattern.params)[i - 1]] = match[i]
          }
          return completeParams(pattern)
        }
      }
    }
  },

  setMatch(dispatch, match) {
    dispatch({
      type: constants.SET_MATCH,
      payload: match,
    })
  },
}

export default routerActions
