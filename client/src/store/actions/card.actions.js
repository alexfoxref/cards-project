import { constants } from '../constants'

export const cardActions = {
  setCards(dispatch, cards = [], loaded = true) {
    const sortedCards = cards.sort(
      (f, s) => Date.parse(s.date) - Date.parse(f.date)
    )

    this.setLoadedCards(dispatch, loaded)

    dispatch({
      type: constants.CARD_SET,
      payload: sortedCards,
    })
  },

  addCard(dispatch, card) {
    dispatch({
      type: constants.CARD_ADD,
      payload: card,
    })
  },

  updateCard(dispatch, card) {
    dispatch({
      type: constants.CARD_UPDATE,
      payload: { ...card },
    })
  },

  deleteCard(dispatch, id) {
    dispatch({
      type: constants.CARD_DELETE,
      payload: id,
    })
  },

  setLoadedCards(dispatch, bool) {
    dispatch({
      type: constants.CARD_LOADED,
      payload: bool,
    })
  },
}
