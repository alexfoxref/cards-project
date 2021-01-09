import { validationResult } from '../../utils'
import { constants } from '../constants'

const getErrors = (form, validators) => {
  const result = validators(form)

  return validationResult(result)
}

export const validationActions = {
  setValidationErrors(dispatch, errors = {}) {
    dispatch({
      type: constants.VALIDATION_SET_ERRORS,
      payload: errors,
    })
  },

  validateForm(dispatch, form, validators) {
    const errors = getErrors(form, validators)

    this.setValidationErrors(dispatch, errors.errors)
  },

  clearValdationErrors(dispatch) {
    this.setValidationErrors(dispatch, {})
  },
}
