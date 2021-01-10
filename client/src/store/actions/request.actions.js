import { config } from '../../config'
import { constants } from '../constants'
import { authActions } from './auth.actions'
import { messageActions } from './message.actions'

export const requestActions = {
  setLoading(dispatch, loading) {
    dispatch({
      type: constants.REQUEST_SET_LOADING,
      payload: loading,
    })
  },

  setError(dispatch, message) {
    dispatch({
      type: constants.REQUEST_SET_ERRORS,
      payload: message,
    })
  },

  async getRequest(
    dispatch,
    url,
    method = 'GET',
    body = null,
    headers = {},
    access_token
  ) {
    this.setLoading(dispatch, true)
    try {
      if (body) {
        body = JSON.stringify(body)
        headers['Content-Type'] = 'application/json'
      }

      if (access_token) {
        headers['Authorization'] = `Bearer ${access_token}`
      }

      const response = await fetch(url, {
        method,
        body,
        headers,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ?? `Что-то пошло не так. Повторите попытку позже.`
        )
      }
      this.setLoading(dispatch, false)

      if (data.message) {
        messageActions.message(dispatch, data.message)
      }

      return data
    } catch (e) {
      this.setLoading(dispatch, false)
      this.setError(dispatch, e.message)
      throw e
    }
  },

  async refreshToken(dispatch, token) {
    try {
      const { data } = await this.getRequest(
        dispatch,
        '/api/auth/refresh',
        'POST',
        token
      )

      authActions.login(dispatch, data)

      return data.token.access_token
    } catch (e) {}
  },

  async getRequestWithAuth(
    dispatch,
    url,
    method = 'GET',
    body,
    headers,
    token
  ) {
    try {
      let { access_token } = token

      if (Date.now() > token.expires_in) {
        access_token = await this.refreshToken(dispatch, token)
      }

      return await this.getRequest(
        dispatch,
        url,
        method,
        body,
        headers,
        access_token
      )
    } catch (e) {}
  },

  clearError(dispatch) {
    this.setError(dispatch, null)
  },

  async registerRequest(dispatch, form) {
    try {
      return await this.getRequest(dispatch, '/api/auth/register', 'POST', form)
    } catch (e) {}
  },

  async loginRequest(dispatch, form) {
    try {
      return await this.getRequest(dispatch, '/api/auth/login', 'POST', form)
    } catch (e) {}
  },

  async cardsRequest(dispatch, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        '/api/card',
        'GET',
        null,
        {},
        token
      )
    } catch (e) {}
  },

  async cardRequest(dispatch, id, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        `/api/card/${id}`,
        'GET',
        null,
        {},
        token
      )
    } catch (e) {}
  },

  async cardEditRequest(dispatch, id, body, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        `/api/card/edit/${id}`,
        'POST',
        body,
        {},
        token
      )
    } catch (e) {}
  },

  async cardsUserRequest(dispatch, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        '/api/card/user/cards',
        'GET',
        null,
        {},
        token
      )
    } catch (e) {}
  },

  async cardCreateRequest(dispatch, body, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        '/api/card/user/create',
        'POST',
        body,
        {},
        token
      )
    } catch (e) {}
  },

  async cardDeleteRequest(dispatch, id, body, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        `/api/card/${id}`,
        'DELETE',
        body,
        {},
        token
      )
    } catch (e) {}
  },

  async cardUpdateRequest(dispatch, id, body, token) {
    try {
      return await this.getRequestWithAuth(
        dispatch,
        `/api/card/${id}`,
        'PUT',
        body,
        {},
        token
      )
    } catch (e) {}
  },
}
