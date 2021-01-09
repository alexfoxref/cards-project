import utils from '../utils'

export const combineReducers = (reducers = {}) => {
  return (state, action) => {
    for (const key in reducers) {
      if (reducers.hasOwnProperty(key)) {
        const newState = reducers[key](state, action)

        if (!utils.isEqual(state, newState)) return newState
      }
    }

    return state
  }
}
