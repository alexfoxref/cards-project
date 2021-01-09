import { constants, initialState } from '../constants'

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.AUTH_LOGIN:
      return {
        ...state,
        auth: {
          ...state.auth,
          ...action.payload,
          isAuthenticated: !!action.payload.token?.access_token,
        },
      }
    case constants.AUTH_LOGOUT:
      return initialState
    default:
      return state
  }
}
