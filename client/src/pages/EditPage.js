import { useCallback, useEffect, useState, useValue } from '../core/Core'
import { useHistory, useMatch } from '../core/Router'
import { useAppStore } from '../hooks'
import { cardValidators } from '../utils'

export const EditPage = () => {
  const {
    params: { id },
  } = useMatch()

  const { push } = useHistory()

  const {
    auth: { token, userId },
    card: { cards },
    request: { loading },
    validation: { errors: validationErrors },
    validateForm,
    cardEditRequest,
    cardDeleteRequest,
    deleteCard,
    cardUpdateRequest,
    updateCard,
    setCards,
  } = useAppStore()
  const [card, setCard] = useState(() => cards.find(c => c._id === id))
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    image: false,
    tags: false,
  })

  useEffect(async () => {
    if (!card) {
      try {
        const body = { userId }
        const { data } = await cardEditRequest(id, body, token)

        if (data) {
          setCard(data)
          setCards([data], false)
        }
      } catch (e) {}
    }
  }, [])

  const changeHandler = useCallback(
    event => {
      setTouched(prev => ({ ...prev, [event.target.name]: true }))
      const { title, image, description, tags } = card
      const form = { title, image, description, tags }
      const newForm = { ...form, [event.target.name]: event.target.value }
      const newCard = { ...card, [event.target.name]: event.target.value }

      validateForm(newForm, cardValidators)
      setCard(newCard)
    },
    [card]
  )

  const touchHandler = useCallback(event => {
    setTouched(prev => ({ ...prev, [event.target.name]: true }))
  }, [])

  const changeTagsHandler = useCallback(tags => {
    setCard(prev => ({ ...prev, tags }))
  }, [])

  const handleSave = useCallback(async () => {
    setTouched(prev => {
      return Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    })

    if (Object.keys(validationErrors).length === 0) {
      try {
        const body = { userId, card }

        const { data } = await cardUpdateRequest(id, body, token)

        if (data) {
          updateCard(data)
          push('/')
        }
      } catch (e) {}
    }
  }, [card, validationErrors])

  const handleRemove = useCallback(async () => {
    try {
      const body = { userId }

      const res = await cardDeleteRequest(id, body, token)

      deleteCard(id)
      push('/')
    } catch (e) {}
  }, [])

  return `
    <div class="container">
    ${
      loading
        ? `<Loader />`
        : !card
        ? `Такой карточки не существует.`
        : `
          <div class="row">
            <div 
              class="col s12"
            >
              <Input 
                id="title"
                type="text"
                name="title"
                oninput="${useValue(changeHandler)}"
                onblur="${useValue(touchHandler)}"
                value="${card.title}"
                label="Название карточки"
                error="${
                  validationErrors.hasOwnProperty('title') && touched.title
                }"
                helper="${
                  validationErrors.hasOwnProperty('title') && touched.title
                }"
                helperMessage="${validationErrors.title ?? ''}"
                classes="create"
              />
      
              <Input 
                id="image"
                type="text"
                name="image"
                oninput="${useValue(changeHandler)}"
                onblur="${useValue(touchHandler)}"
                value="${card.image}"
                label="URL картинки"
                error="${
                  validationErrors.hasOwnProperty('image') && touched.image
                }"
                helper="${
                  validationErrors.hasOwnProperty('image') && touched.image
                }"
                helperMessage="${validationErrors.image ?? ''}"
                classes="create"
              />
      
              <TextArea 
                id="description"
                name="description"
                oninput="${useValue(changeHandler)}"
                onblur="${useValue(() => {})}"
                value="${card.description}"
                label="Описание карточки"
                error="false"
                helper="false"
                helperMessage=""
                classes="create"
              />
      
              <TagInput 
                value="${useValue(card.tags)}"
                label="Тэги карточки"
                changeTagsHandler="${useValue(changeTagsHandler)}"
              />
      
              <Button 
                disabled="${loading}"
                title="Сохранить изменения"
                onclick="${useValue(handleSave)}"
              />
              
              <Button 
                disabled="${loading}"
                title="Удалить"
                onclick="${useValue(handleRemove)}"
              />
      
            </div>
          </div>
        `
    }
    </div>
  `
}
