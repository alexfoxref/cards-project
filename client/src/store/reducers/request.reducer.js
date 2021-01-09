import { constants, initialState } from '../constants'

export const requestReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.REQUEST_SET_LOADING:
      return {
        ...state,
        request: {
          ...state.request,
          loading: action.payload,
        },
      }
    case constants.REQUEST_SET_ERRORS:
      return {
        ...state,
        request: {
          ...state.request,
          error: action.payload,
        },
      }
    default:
      return state
  }
}
