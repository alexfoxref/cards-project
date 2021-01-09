export const selectOptions = {
  all: 'all',
  title: 'title',
  description: 'description',
  tags: 'tags',
  creator: 'creator',
}

export const initialState = {
  request: {
    loading: false,
    error: null,
  },

  auth: {
    token: null,
    userId: null,
    userName: null,
    isAuthenticated: false,
  },

  validation: {
    errors: {},
  },

  card: {
    cards: [],
    loaded: false,
  },

  search: {
    data: [],
    param: selectOptions.all,
    value: '',
  },
}

export const constants = {
  REQUEST_SET_LOADING: 'REQUEST_SET_LOADING',
  REQUEST_SET_ERRORS: 'REQUEST_SET_ERRORS',

  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',

  CARD_SET: 'CARD_SET',
  CARD_UPDATE: 'CARD_UPDATE',
  CARD_DELETE: 'CARD_DELETE',
  CARD_ADD: 'CARD_ADD',
  CARD_LOADED: 'CARD_LOADED',

  VALIDATION_SET_ERRORS: 'VALIDATION_SET_ERRORS',

  SEARCH_SET_PARAM: 'SEARCH_SET_PARAM',
  SEARCH_SET_VALUE: 'SEARCH_SET_VALUE',
  SEARCH_SET_DATA: 'SEARCH_SET_DATA',
  SEARCH_INIT: 'SEARCH_INIT',
}
