const { body } = require('express-validator')

module.exports = {
  registerValidators: [
    body('email', 'Некорректный email').trim().normalizeEmail().isEmail(),
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Минимальная длина - 2 символа')
      .isLength({ max: 20 })
      .withMessage('Максимальная длина - 20 символов'),
    body('password', 'Минимальная длина пароля - 6 символов').isLength({
      min: 6,
    }),
    body('repeatPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать')
      }

      return true
    }),
  ],

  loginValidators: [
    body('email', 'Введите корректный email').trim().normalizeEmail().isEmail(),
    body('password', 'Введите корректный пароль').exists(),
  ],
}
