import { useEffect } from '../../core/Core'
import utils from '../../core/utils'
import './styles.scss'

export const Input = ({
  id = null,
  type = 'text',
  name = null,
  oninput = null,
  onblur = null,
  value = '',
  label = '',
  helper = null,
  helperMessage = '',
  error = null,
  classes = '',
}) => {
  useEffect(() => {
    M.updateTextFields()
  }, [])

  return `
    <div class="input-field">
      <input 
        ${id ? `id="${id}"` : ''}
        type="${type}"
        ${name ? `name="${name}"` : ''}
        class="custom-input${utils.normalizeValue(error) ? ' error' : ''}${
    classes.length > 0 ? ` ${classes}` : ''
  }"
        ${oninput ? `oninput="${oninput}"` : ''}
        ${onblur ? `onblur="${onblur}"` : ''}
        value="${value}"
      />
      ${
        id
          ? `
            <label 
              for="${id}"
            >
              ${label}
            </label>`
          : ''
      }
      ${
        utils.normalizeValue(helper)
          ? `
            <span 
              class="helper-text custom-helper${
                utils.normalizeValue(error) ? ' error' : ''
              }"
            >
              ${helperMessage}
            </span>
          `
          : ''
      }
    </div>
  `
}
