import { constants, initialState } from './config'

const routerReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.SET_LOCATION:
      return {
        ...state,
        location: action.payload,
      }
    case constants.SET_MATCH:
      return {
        ...state,
        match: action.payload,
      }

    default:
      return state
  }
}

export default routerReducer
