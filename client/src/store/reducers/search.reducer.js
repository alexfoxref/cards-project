import { constants, initialState } from '../constants'

export const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.SEARCH_SET_PARAM:
      return { ...state, search: { ...state.search, param: action.payload } }
    case constants.SEARCH_SET_VALUE:
      return { ...state, search: { ...state.search, value: action.payload } }
    case constants.SEARCH_SET_DATA:
      return { ...state, search: { ...state.search, data: action.payload } }
    default:
      return state
  }
}
