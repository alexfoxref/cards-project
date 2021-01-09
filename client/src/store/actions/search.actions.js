import { constants } from '../constants'

export const searchActions = {
  setSearchParam(dispatch, param) {
    dispatch({
      type: constants.SEARCH_SET_PARAM,
      payload: param,
    })
  },

  setSearchValue(dispatch, value) {
    dispatch({
      type: constants.SEARCH_SET_VALUE,
      payload: value,
    })
  },

  setSearchData(dispatch, data, param, value) {
    let returningData = data
    const regexp = new RegExp(value, 'i')

    switch (param) {
      case 'all':
        returningData = data.filter(
          ({ title, description, tags, creator: { name } }) =>
            regexp.test(title) ||
            regexp.test(description) ||
            regexp.test(name) ||
            tags.some(({ tag }) => regexp.test(tag))
        )
        break
      case 'title':
        returningData = data.filter(({ title }) => regexp.test(title))
        break
      case 'description':
        returningData = data.filter(({ description }) =>
          regexp.test(description)
        )
        break
      case 'tags':
        returningData = data.filter(({ tags }) =>
          tags.some(({ tag }) => regexp.test(tag))
        )
        break
      case 'creator':
        returningData = data.filter(({ creator: { name } }) =>
          regexp.test(name)
        )
        break
      default:
        returningData = data
    }

    dispatch({
      type: constants.SEARCH_SET_DATA,
      payload: returningData,
    })
  },
}
