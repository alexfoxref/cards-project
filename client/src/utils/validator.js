import validator from 'validator'
import utils from '../core/utils'

const defaultErrorMessage = 'Ошибка!'

export const fieldValidator = (value = '', arr = []) => {
  let prevValue = value
  const validationResult = {
    value: prevValue,
    isValid: true,
    errorMessage: null,
  }

  for (const v of arr) {
    if (utils.isFunction(v)) {
      prevValue = v(prevValue)
      validationResult.value = prevValue
    } else {
      const val = v.validator
      const validator =
        !val || (val && !utils.isFunction(val)) ? () => false : val
      const errorMessage = v.message ?? defaultErrorMessage

      if (!validator(prevValue)) {
        return {
          ...validationResult,
          ...{
            isValid: false,
            errorMessage,
          },
        }
      }
    }
  }

  return validationResult
}

export const validationResult = result => ({
  errors: Object.keys(result)
    .filter(key => !result[key].isValid)
    .reduce((acc, key) => {
      return { ...acc, [key]: result[key].errorMessage }
    }, {}),
  isEmpty() {
    return Object.keys(this.errors).length === 0
  },
  getError(field) {
    if (this.errors.hasOwnProperty(field)) {
      return { [field]: this.errors[field] }
    }

    return {}
  },
})

const { trim, normalizeEmail, isEmpty, isEmail, isLength, isURL } = validator
const isNotEmpty = value => !isEmpty(value)
const isEqual = (value1, value2) => value1 === value2

export const validators = {
  trim,
  normalizeEmail,
  isEmpty,
  isEmail,
  isLength,
  isURL,
  isNotEmpty,
  isEqual,
}
