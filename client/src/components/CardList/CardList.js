import {
  getValue,
  useArray,
  useEffect,
  useMemo,
  useValue,
} from '../../core/Core'
import { useAppStore } from '../../hooks'

export const CardList = ({ own = useValue(false) }) => {
  const {
    auth: { userId, token },
    card: { cards, loaded },
    search: { data: searchData },
    request: { loading },
    cardsUserRequest,
    cardsRequest,
    setCards,
  } = useAppStore()

  let data = useMemo(() => {
    return getValue(own)
      ? cards.filter(card => card.creator._id === userId)
      : searchData
  }, [cards, searchData, own])

  useEffect(async () => {
    try {
      if (!loaded) {
        if (getValue(own)) {
          const { data: requestData } = await cardsUserRequest(token)

          if (requestData) {
            data = requestData
            setCards(requestData, false)
          }
        } else {
          const { data: requestData } = await cardsRequest(token)

          if (requestData) {
            data = requestData
            setCards(requestData)
          }
        }
      }
    } catch (e) {}
  }, [own])

  return `
    <div class="row">

      ${
        loading
          ? `<Loader />`
          : data.length === 0
          ? 'Карточек пока нет.'
          : useArray(
              data.map(
                card => `
        <CardItem card="${useValue(card)}" key="${card._id}"/>
      `
              )
            )
      }

    </div>
  `
}
