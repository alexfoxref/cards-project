import { config } from '../../config'
import { constants } from '../constants'

export const authActions = {
  authInit(dispatch) {
    const data = JSON.parse(localStorage.getItem(config.storageName) ?? '{}')

    if (data.token) {
      this.login(dispatch, data)
    }
  },

  login(dispatch, data) {
    localStorage.setItem(config.storageName, JSON.stringify(data))

    dispatch({
      type: constants.AUTH_LOGIN,
      payload: data,
    })
  },

  logout(dispatch) {
    localStorage.removeItem(config.storageName)

    dispatch({
      type: constants.AUTH_LOGOUT,
    })
  },
}
