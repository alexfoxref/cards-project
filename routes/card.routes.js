const Router = require('express')
const auth = require('../middlewares/auth.middleware')
const Card = require('../models/Card')
const Tag = require('../models/Tag')
const User = require('../models/User')

const router = Router()
const isCreator = (req, creatorId) => {
  return (
    req.body.userId.toString() === creatorId.toString() &&
    req.body.userId.toString() === req.user.userId.toString()
  )
}

const checkTag = async tag => {
  try {
    const existingTag = await Tag.findOne(tag, err => {
      if (err) {
        throw new Error('Ошибка поиска тэга.')
      }
    })

    if (existingTag) return existingTag

    const newTag = new Tag(tag)

    return await newTag.save()
  } catch (e) {
    throw e
  }
}

const saveTags = async tags => {
  try {
    const promises = tags.map(checkTag)

    return await Promise.all(promises)
  } catch (e) {
    throw e
  }
}

const deleteTags = async (oldTags, newTags) => {
  try {
    const deletedTags = [...oldTags, ...newTags].filter(
      ({ _id }) =>
        !newTags.some(({ _id: id }) => id.toString() == _id.toString())
    )

    const promises = deletedTags.map(async ({ _id }) => {
      return await Tag.deleteOne({ _id })
    })

    return await Promise.all(promises)
  } catch (e) {
    throw e
  }
}

const deleteTagsCards = async card => {
  try {
    const promises = card.tags.map(async tagItem => {
      const tag = await Tag.findOne({ ...tagItem }, err => {
        if (err) {
          throw new Error('Ошибка поиска тэга.')
        }
      })

      tag.cards = tag.cards.filter(
        cardId => cardId.toString() !== card._id.toString()
      )

      if (tag.cards.length === 0) {
        await Tag.deleteOne({ _id: tag._id })
      } else {
        await tag.save()
      }
    })

    return await Promise.all(promises)
  } catch (e) {
    throw e
  }
}

const changeTagsCards = async (tags, card) => {
  const promises = tags.map(async tag => {
    tag.cards = !tag.cards.includes(card._id)
      ? tag.cards.concat(card._id)
      : tag.cards

    await tag.save()
  })

  return await Promise.all(promises)
}

//получение всех карточек
router.get('/', auth, async (req, res) => {
  try {
    const cards = await Card.find()
      .populate('tags', 'tag')
      .populate('creator', 'name')

    res.json({ data: cards })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//получение карточки по id
router.get('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id, err => {
      if (err) {
        return res.status(404).json({ message: 'Содержимое не найдено.' })
      }
    })
      .populate('tags', 'tag')
      .populate('creator', 'name')

    res.json({ data: card })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//получение карточки для редактирования по id
router.post('/edit/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id, err => {
      if (err) {
        return res.status(404).json({ message: 'Содержимое не найдено.' })
      }
    })
      .populate('tags', 'tag')
      .populate('creator', 'name')

    if (!isCreator(req, card.creator._id)) {
      return res
        .status(403)
        .json({ message: 'Недостаточно прав для доступа к содержимому.' })
    }

    res.json({ data: card })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//получение всех карточек пользователя
router.get('/user/cards', auth, async (req, res) => {
  try {
    const cards = await Card.find({ creator: req.user.userId }, err => {
      if (err) {
        return res
          .status(404)
          .json({ message: 'Ошибка поиска данных пользователя.' })
      }
    })
      .populate('tags', 'tag')
      .populate('creator', 'name')

    res.json({ data: cards })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//создание карточки пользователем
router.post('/user/create', auth, async (req, res) => {
  try {
    const { title, description, image } = req.body
    const tags = await saveTags(req.body.tags)
    const user = await User.findById(req.user.userId)
    const card = new Card({
      title,
      image,
      tags,
      description,
      creator: user,
    })

    await card.save()
    await changeTagsCards(tags, card)

    res.status(201).json({ data: card, message: 'Карточка успешно создана.' })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//обновление карточки по id создателем карточки
router.put('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id, err => {
      if (err) {
        res.status(404).json({ message: 'Содержимое не найдена.' })
      }
    })
      .populate('creator', 'name')
      .populate('tags', 'tag')

    if (!isCreator(req, card.creator._id)) {
      return res
        .status(403)
        .json({ message: 'Недостаточно прав для доступа к содержимому.' })
    }

    const { title, image, description } = req.body.card
    const tags = await saveTags(req.body.card.tags)

    await deleteTags(card.tags, tags)

    card.title = title
    card.image = image
    card.description = description
    card.tags = tags
    card.date = Date.now()

    await card.save()
    await changeTagsCards(tags, card)

    res.json({
      data: card,
      message: 'Содержимое обновлено.',
    })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

//удаление карточки по id создателем карточки
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id, err => {
      if (err) {
        return res.status(404).json({ message: 'Содержимое не найдено.' })
      }
    })

    if (!isCreator(req, card.creator)) {
      return res
        .status(403)
        .json({ message: 'Недостаточно прав для доступа к содержимому.' })
    }

    await deleteTagsCards(card)
    await Card.deleteOne({
      _id: req.params.id,
    })

    res.json({ message: 'Содержимое удалено.' })
  } catch (e) {
    res
      .status(500)
      .json({ message: e.message ?? 'Что-то пошло не так, попробуйте снова.' })
  }
})

module.exports = router
