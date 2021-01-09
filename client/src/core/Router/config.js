let config = {
  title: true,
  separator: '|',
  baseTitle: document.title,
}

const constants = {
  BASE: window.location.origin,
  SET_LOCATION: 'SET_LOCATION',
  SET_MATCH: 'SET_MATCH',
}

const initialState = {
  location: {
    href: '',
    pathname: '',
    search: null,
    searchParams: null,
    hash: null,
    state: null,
  },
  match: {
    pattern: null,
    regexp: null,
    exact: null,
    params: {},
    title: null,
  },
}

const setConfig = options => {
  config = { ...config, ...options }
}

export { config, setConfig, constants, initialState }
