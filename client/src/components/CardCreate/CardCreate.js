import { useCallback, useEffect, useState, useValue } from '../../core/Core'
import { useHistory } from '../../core/Router'
import { useAppStore } from '../../hooks'
import { cardValidators } from '../../utils'

const initialForm = {
  title: '',
  image: '',
  description: '',
  tags: [],
}

const initialTouched = Object.keys(initialForm).reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {}
)

export const CardCreate = () => {
  const history = useHistory()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState(initialTouched)
  const {
    auth: { userId, token },
    request: { loading },
    validation: { errors: validationErrors },
    validateForm,
    addCard,
    cardCreateRequest,
  } = useAppStore()

  useEffect(() => {
    validateForm(initialForm, cardValidators)
  }, [])

  const submitHandler = useCallback(
    async event => {
      event.preventDefault()

      setTouched(prev => {
        return Object.keys(prev).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      })

      if (Object.keys(validationErrors).length === 0) {
        try {
          const body = {
            ...form,
            userId,
          }
          const { data: card } = await cardCreateRequest(body, token)

          addCard(card)

          history.push('/profile?tab=all')
        } catch (e) {}
      }
    },
    [form, validationErrors]
  )

  const changeHandler = useCallback(
    event => {
      setTouched(prev => ({ ...prev, [event.target.name]: true }))

      const newForm = { ...form, [event.target.name]: event.target.value }

      validateForm(newForm, cardValidators)
      setForm(newForm)
    },
    [form]
  )

  const touchHandler = useCallback(event => {
    setTouched(prev => ({ ...prev, [event.target.name]: true }))
  }, [])

  const changeTagsHandler = useCallback(tags => {
    setForm(prev => ({ ...prev, tags }))
  }, [])

  return `
    <div class="row">
      <form 
        class="col s12"
        onsubmit="${useValue(submitHandler)}"
      >
        <Input 
          id="title"
          type="text"
          name="title"
          oninput="${useValue(changeHandler)}"
          onblur="${useValue(touchHandler)}"
          value="${form.title}"
          label="Название карточки"
          error="${validationErrors.hasOwnProperty('title') && touched.title}"
          helper="${validationErrors.hasOwnProperty('title') && touched.title}"
          helperMessage="${validationErrors.title ?? ''}"
          classes="create"
        />

        <Input 
          id="image"
          type="text"
          name="image"
          oninput="${useValue(changeHandler)}"
          onblur="${useValue(touchHandler)}"
          value="${form.image}"
          label="URL картинки"
          error="${validationErrors.hasOwnProperty('image') && touched.image}"
          helper="${validationErrors.hasOwnProperty('image') && touched.image}"
          helperMessage="${validationErrors.image ?? ''}"
          classes="create"
        />

        <TextArea 
          id="description"
          name="description"
          oninput="${useValue(changeHandler)}"
          onblur="${useValue(() => {})}"
          value="${form.description}"
          label="Описание карточки"
          error="false"
          helper="false"
          helperMessage=""
          classes="create"
        />

        <TagInput 
          label="Тэги карточки"
          changeTagsHandler="${useValue(changeTagsHandler)}"
        />

        <Button 
          disabled="${loading}"
          title="Создать карточку"
          type="submit"
        />

      </form>
    </div>
  `
}
