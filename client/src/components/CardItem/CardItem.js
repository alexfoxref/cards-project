import { getValue, useArray, useCallback, useValue } from '../../core/Core'
import { useHistory } from '../../core/Router'
import './style.scss'

export const CardItem = ({ card = useValue({}) }) => {
  const { title, image, tags, description, creator, date, _id: id } = getValue(
    card
  )

  const { push } = useHistory()

  const onCardClick = useCallback(() => {
    push(`/card/${id}`)
  }, [])

  return card
    ? `
    <div class="col s4">
      <div class="card card-item" onclick="${useValue(onCardClick)}">
        <div class="card-image card-item-image">
          <img src="${image}" />
        </div>
        <div class="card-content card-item-content">
          <span class="card-title">${title}</span>
          <p>${
            description.length === 0
              ? `<small>Описание отсутствует</small>`
              : description
          }</p>
          <div class="card-item-tags">
            ${
              tags.length === 0
                ? `
              <div class="chip-empty"></div>
            `
                : useArray(
                    tags.map(
                      tag =>
                        `<div class="chip" key="${tag._id}">${tag.tag}</div>`
                    )
                  )
            }
          </div>
          <div class="card-item-info">
            <small>Автор: ${creator.name}</small>
            <small>Дата: ${new Date(date).toLocaleDateString()}</small>
          </div>
        </div>
      </div>
    </div>
  `
    : ''
}
