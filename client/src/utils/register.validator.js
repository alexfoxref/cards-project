import { fieldValidator, validators } from './validator'

const {
  trim,
  isNotEmpty,
  isLength,
  normalizeEmail,
  isEmail,
  isEqual,
} = validators

export const registerValidators = data => ({
  name: fieldValidator(data.name, [
    trim,
    { validator: isNotEmpty, message: 'Введите Имя' },
    {
      validator: value => isLength(value, { min: 2 }),
      message: 'Минимальная длина имени - 2 символа',
    },
    {
      validator: value => isLength(value, { max: 20 }),
      message: 'Максимальная длина имени - 20 символов',
    },
  ]),
  email: fieldValidator(data.email, [
    trim,
    { validator: isNotEmpty, message: 'Введите Email' },
    normalizeEmail,
    { validator: isEmail, message: 'Введите корректый Email' },
  ]),
  password: fieldValidator(data.password, [
    { validator: isNotEmpty, message: 'Введите пароль' },
    {
      validator: value => isLength(value, { min: 6 }),
      message: 'Минимальная длина пароля - 6 символов',
    },
  ]),
  repeatPassword: fieldValidator(data.repeatPassword, [
    { validator: isNotEmpty, message: 'Повторно введите пароль' },
    {
      validator: value => isEqual(value, data.password),
      message: 'Пароли должны совпадать',
    },
    {
      validator: value => isLength(value, { min: 6 }),
      message: 'Пароли должны совпадать',
    },
  ]),
})
