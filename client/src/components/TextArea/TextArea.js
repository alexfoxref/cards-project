import { useEffect, useRef, useValue } from '../../core/Core'
import utils from '../../core/utils'

export const TextArea = ({
  id = null,
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
  const textArea = useRef(null)

  useEffect(() => {
    M.updateTextFields()
  }, [])

  useEffect(() => {
    M.textareaAutoResize(textArea.current)
  }, [textArea.current, value])

  return `
    <div class="input-field">
      <textarea 
        ref="${useValue(textArea)}"
        ${id ? `id="${id}"` : ''}
        ${name ? `name="${name}"` : ''}
        class="materialize-textarea custom-input${
          utils.normalizeValue(error) ? ' error' : ''
        }${classes.length > 0 ? ` ${classes}` : ''}"
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
