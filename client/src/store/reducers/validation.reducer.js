import { constants, initialState } from '../constants'

export const validationReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.VALIDATION_SET_ERRORS:
      return {
        ...state,
        validation: { ...state.validation, errors: action.payload },
      }
    default:
      return state
  }
}
