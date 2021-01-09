import { authActions } from './auth.actions'

const createMessage = (text, error) => {
  if (window.M && text) {
    window.M.toast({ html: error ? `[Ошибка]: ${text}` : text })
  }
}

const UnautorizeText = 'Нет авторизации.'

export const messageActions = {
  message(dispatch, text) {
    createMessage(text)
  },

  errorMessage(dispatch, text) {
    createMessage(text, true)

    if (text === UnautorizeText) {
      authActions.logout(dispatch)
    }
  },
}
