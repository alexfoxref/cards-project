import {
  useArray,
  useCallback,
  useEffect,
  useState,
  useValue,
} from '../core/Core'
import { useHistory, useMatch } from '../core/Router'
import { useAppStore } from '../hooks'

export const CardPage = () => {
  const {
    params: { id },
  } = useMatch()

  const { push } = useHistory()

  const {
    auth: { token, userId },
    card: { cards },
    request: { loading },
    cardRequest,
    cardDeleteRequest,
    deleteCard,
    setCards,
  } = useAppStore()
  const [card, setCard] = useState(() => cards.find(c => c._id === id))

  useEffect(async () => {
    if (!card) {
      try {
        const { data } = await cardRequest(id, token)

        if (data) {
          setCard(data)
          setCards([data], false)
        }
      } catch (e) {}
    }
  }, [])

  const onEditClick = useCallback(() => {
    push(`/edit/${id}`)
  }, [])

  const onRemoveClick = useCallback(async () => {
    try {
      const body = { userId }

      await cardDeleteRequest(id, body, token)

      deleteCard(id)
      push('/')
    } catch (e) {}
  }, [])

  return `
    <div class="container">
      ${
        loading
          ? `<Loader />`
          : !card
          ? `Такой карточки не существует.`
          : `
          <div class="col s12">
            <div class="card card-item card-detail">
              <div class="card-image">
                <img src="${card.image}" />
              </div>
              <div class="card-content">
                <span class="card-title">${card.title}</span>
                <p>${
                  card.description.length === 0
                    ? `<small>Описание отсутствует</small>`
                    : card.description
                }</p>
                <div class="card-item-tags">
                  ${
                    card.tags.length === 0
                      ? `
                    <div class="chip-empty"></div>
                  `
                      : useArray(
                          card.tags.map(
                            tag =>
                              `<div class="chip" key="${tag._id}">${tag.tag}</div>`
                          )
                        )
                  }
                </div>
                <div class="card-item-info">
                  <small>Автор: ${card.creator.name}</small>
                  <small>Дата: ${new Date(
                    card.date
                  ).toLocaleDateString()}</small>
                </div>
                ${
                  userId === card.creator._id
                    ? `<div class="card-item-buttons">
                  <Button
                    title="Редактировать"
                    onclick="${useValue(onEditClick)}"
                  />
                  <Button 
                    title="Удалить"
                    onclick="${useValue(onRemoveClick)}"
                  />
                </div>`
                    : ''
                }
              </div>
            </div>
          </div>
        `
      }
    </div>
  `
}
