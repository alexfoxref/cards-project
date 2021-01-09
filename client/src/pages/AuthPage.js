import {
  useArray,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useValue,
} from '../core/Core'
import { useHistory } from '../core/Router'
import { authValidators, registerValidators } from '../utils'
import { useAppStore } from '../hooks'
import './style.scss'
import { config } from '../config'

const initialForm = {
  name: '',
  email: '',
  password: '',
  repeatPassword: '',
}

const initialTouched = Object.keys(initialForm).reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {}
)

const ALL = 'all'

const input = options => ({
  page: ALL,
  id: '',
  type: 'text',
  oninput: null,
  onblur: null,
  value: '',
  label: '',
  helper: false,
  helperMessage: '',
  ...options,
})

export const AuthPage = ({ page }) => {
  const { push } = useHistory()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState(initialTouched)
  const {
    login,
    request: { loading },
    loginRequest,
    registerRequest,
    validation: { errors: validationErrors },
    validateForm,
  } = useAppStore()

  const validators = useCallback(
    form =>
      page === config.pages.login
        ? authValidators(form)
        : page === config.pages.register
        ? registerValidators(form)
        : {},
    [page]
  )

  useEffect(() => {
    setForm(initialForm)
    validateForm(initialForm, validators)
  }, [page])

  const changeHandler = useCallback(
    event => {
      setTouched(prev => ({ ...prev, [event.target.name]: true }))

      const newForm = { ...form, [event.target.name]: event.target.value }

      validateForm(newForm, validators)
      setForm(newForm)
    },
    [form, validators]
  )

  const touchHandler = useCallback(event => {
    setTouched(prev => ({ ...prev, [event.target.name]: true }))
  }, [])

  const inputs = useMemo(
    () => [
      input({
        page: 'register',
        id: 'name',
        label: 'Введите Имя',
        value: form.name,
        helper: validationErrors.hasOwnProperty('name') && touched.name,
        helperMessage: validationErrors.name ?? '',
      }),
      input({
        id: 'email',
        type: 'email',
        label: 'Введите Email',
        value: form.email,
        helper: validationErrors.hasOwnProperty('email') && touched.email,
        helperMessage: validationErrors.email ?? '',
      }),
      input({
        id: 'password',
        type: 'password',
        label: 'Введите пароль',
        value: form.password,
        helper: validationErrors.hasOwnProperty('password') && touched.password,
        helperMessage: validationErrors.password ?? '',
      }),
      input({
        page: 'register',
        id: 'repeatPassword',
        type: 'password',
        label: 'Повторите пароль',
        value: form.repeatPassword,
        helper:
          validationErrors.hasOwnProperty('repeatPassword') &&
          touched.repeatPassword,
        helperMessage: validationErrors.repeatPassword ?? '',
      }),
    ],
    [form, validationErrors, touched]
  )

  const loginHandler = useCallback(async () => {
    setTouched(prev => {
      return Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    })

    if (Object.keys(validationErrors).length === 0) {
      try {
        const { data } = await loginRequest(form)

        login(data)
        push('/')
      } catch (e) {}
    }
  }, [form, validationErrors])

  const registerHandler = useCallback(async () => {
    setTouched(prev => {
      return Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    })

    if (Object.keys(validationErrors).length === 0) {
      try {
        await registerRequest(form)

        push('/auth/login')
      } catch (e) {}
    }
  }, [form, validationErrors])

  const submitHandler = useCallback(async () => {
    if (page === config.pages.login) {
      return await loginHandler()
    } else if (page === config.pages.register) {
      return await registerHandler()
    } else return null
  }, [page, form, validationErrors])

  const submitTitle = useMemo(() => {
    return page === config.pages.login
      ? 'Войти'
      : page === config.pages.register
      ? 'Зарегистрироваться'
      : 'Ошибка!'
  }, [page])

  const cardTitle = useMemo(() => {
    return page === config.pages.login
      ? 'Вход в систему'
      : page === config.pages.register
      ? 'Регистрация'
      : 'Ошибка!'
  }, [page])

  return `
    <div class="row">
      <div class="col s6 offset-s3">
        <div class="card auth-card light-blue darken-2">
          <div class="card-content white-text">
            <span class="card-title">
              ${cardTitle}
            </span>
            
            <div>
              ${useArray(
                inputs.map(
                  ({
                    page: inputPage,
                    id,
                    type,
                    value,
                    label,
                    helper,
                    helperMessage,
                  }) => {
                    return inputPage === page || inputPage === ALL
                      ? `
                        <Input
                          key="${id}"
                          id="${id}" 
                          type="${type}"
                          name="${id}"
                          oninput="${useValue(changeHandler)}"
                          onblur="${useValue(touchHandler)}"
                          value="${value}"
                          label="${label}"
                          error="${helper}"
                          helper="${helper}"
                          helperMessage="${helperMessage}"
                        />
                      `
                      : ''
                  }
                )
              )}
            </div>
            
          </div>

          <div class="card-action">

            <Button 
              onclick="${useValue(submitHandler)}"
              disabled="${loading}"
              title="${submitTitle}"
            />
            
          </div>
        </div>
      </div>
    </div>
  `
}
