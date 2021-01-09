const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken-refresh')
const config = require('config')
const { validationResult } = require('express-validator')
const { registerValidators, loginValidators } = require('../utils/validators')
const User = require('../models/User')
const Session = require('../models/Session')

const router = Router()

const exp = 5 * 60 * 1000
const accessExpTime = `${exp}ms`
const refreshExpTime = '30 days'
const delay = 10 * 1000
const expires_in = () => Date.now() + exp - delay

router.post('/register', registerValidators, async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при регистрации.',
      })
    }

    const { email, password, name } = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      return res
        .status(400)
        .json({ message: 'Такой пользователь уже существует.' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({ email, name, password: hashedPassword })

    await user.save()

    res.status(201).json({ message: 'Регистрация прошла успешно.' })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при входе в систему.',
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return (
        res
          .status(400)
          // .json({ message: 'Неверный пароль. Попробуйте снова.' })
          .json({ message: 'Пользователь не найден.' })
      )
    }

    const access_token = jwt.sign(
      {
        userId: user.id,
      },
      config.get('jwtAccessSecret'),
      {
        expiresIn: accessExpTime,
      }
    )
    const refresh_token = jwt.sign(
      {
        userId: user.id,
      },
      config.get('jwtRefreshSecret'),
      {
        expiresIn: refreshExpTime,
      }
    )

    const token = {
      access_token,
      refresh_token,
      expires_in: expires_in(),
    }

    let session = await Session.findOne({ user })

    if (!session) {
      session = new Session({ user, refresh_token })
    } else {
      session.refresh_token = refresh_token
    }

    await session.save()

    res.json({
      data: {
        token,
        userId: user.id,
        userName: user.name,
      },
      message: `Добро пожаловать, ${user.name}!`,
    })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    let { access_token, refresh_token } = req.body

    if (!refresh_token || !access_token) {
      return res.status(401).json({ message: 'Нет авторизации.' })
    }

    await jwt.verify(
      refresh_token,
      config.get('jwtRefreshSecret'),
      async (err, refresh_decoded) => {
        if (err) {
          if (err.name !== 'TokenExpiredError') {
            throw err
          }

          return res.status(401).json({ message: 'Нет авторизации.' })
        }

        const session = await Session.findOne({
          user: refresh_decoded.userId,
          refresh_token,
        }).populate('user', 'name')

        if (!session) {
          return res.status(401).json({ message: 'Нет авторизации.' })
        }

        const access_decoded = jwt.decode(access_token)

        access_token = jwt.refresh(
          access_decoded,
          accessExpTime,
          config.get('jwtAccessSecret')
        )

        refresh_token = jwt.refresh(
          refresh_decoded,
          refreshExpTime,
          config.get('jwtRefreshSecret')
        )

        session.refresh_token = refresh_token

        await session.save()

        const token = {
          access_token,
          refresh_token,
          expires_in: expires_in(),
        }

        res.json({
          data: {
            token,
            userId: session.user._id,
            userName: session.user.name,
          },
        })
      }
    )
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

module.exports = router
