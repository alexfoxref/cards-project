import './style.scss'

export const Button = ({
  classes = '',
  onclick = null,
  disabled = false,
  title = '',
  type = 'button',
}) => {
  return `
    <button 
      type="${type}"
      class="btn orange accent-3 black-text waves-effect waves-light custom-btn${
        classes.length > 0 ? ` ${classes}` : ''
      }"
      ${onclick ? `onclick="${onclick}"` : ''}
      disabled="${disabled}"
    >
      ${title}
    </button>
  `
}
