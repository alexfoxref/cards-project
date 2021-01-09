import { constants, initialState } from '../constants'

export const cardReducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.CARD_LOADED:
      return { ...state, card: { ...state.card, loaded: action.payload } }
    case constants.CARD_SET:
      return {
        ...state,
        card: { ...state.card, cards: action.payload },
      }
    case constants.CARD_UPDATE: {
      const newCards = state.card.cards
        .map(card => {
          if (card._id === action.payload._id) {
            return action.payload
          }

          return card
        })
        .sort((f, s) => Date.parse(s.date) - Date.parse(f.date))

      return { ...state, card: { ...state.card, cards: newCards } }
    }
    case constants.CARD_DELETE: {
      const newCards = state.card.cards.filter(
        card => card._id !== action.payload
      )

      return { ...state, card: { ...state.card, cards: newCards } }
    }
    case constants.CARD_ADD:
      return {
        ...state,
        card: { ...state.card, cards: [action.payload, ...state.card.cards] },
      }
    default:
      return state
  }
}
