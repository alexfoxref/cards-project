import {
  getValue,
  useArray,
  useCallback,
  useEffect,
  useRef,
  useValue,
} from '../../core/Core'
import { useAppStore } from '../../hooks'
import './style.scss'

export const Select = ({
  label = '',
  options = useValue([]),
  classes = '',
}) => {
  const select = useRef(null)
  const { setSearchParam } = useAppStore()

  useEffect(() => {
    const instance = M.FormSelect.init(select.current, { classes })

    return () => {
      instance.destroy()
    }
  }, [select.current])

  const changeHandler = useCallback(event => {
    setSearchParam(event.target.value)
  }, [])

  return `
    <div class="input-field col s12 search-select">
      <select 
        ref="${useValue(select)}"
        onchange="${useValue(changeHandler)}"
      >
        ${useArray(
          getValue(options).map(
            ({ value = '', title = '', selected = false }) => `
          <option 
            key="${value}"
            value="${value}" 
            selected="${selected}" 
          >${title}</option>
        `
          )
        )}
      </select>
      <label>${label}</label>
    </div>
  `
}
