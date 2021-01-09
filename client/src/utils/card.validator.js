import { fieldValidator, validators } from './validator'

const { trim, isNotEmpty, isURL } = validators

export const cardValidators = data => ({
  title: fieldValidator(data.title, [
    trim,
    { validator: isNotEmpty, message: 'Введите название карточки.' },
  ]),
  image: fieldValidator(data.image, [
    trim,
    { validator: isNotEmpty, message: 'Введите URL-адрес картинки.' },
    { validator: isURL, message: 'Введите корректный URL-адрес.' },
  ]),
})
