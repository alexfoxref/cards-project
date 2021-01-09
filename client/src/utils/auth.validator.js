import { fieldValidator, validators } from './validator'

const { trim, normalizeEmail, isEmail, isNotEmpty } = validators

export const authValidators = data => ({
  email: fieldValidator(data.email, [
    trim,
    { validator: isNotEmpty, message: 'Введите Email' },
    normalizeEmail,
    { validator: isEmail, message: 'Введите корректный Email' },
  ]),
  password: fieldValidator(data.password, [
    { validator: isNotEmpty, message: 'Введите пароль' },
  ]),
})
