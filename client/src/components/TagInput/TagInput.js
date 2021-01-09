import {
  getValue,
  useCallback,
  useEffect,
  useRef,
  useState,
  useValue,
} from '../../core/Core'
import './style.scss'

export const TagInput = ({
  label = '',
  changeTagsHandler = useValue(() => {}),
  value = useValue([]),
}) => {
  const tags = useRef(null)
  const tagsInput = useRef(null)
  const chipsData = useRef(null)
  const [labelId, setLabelId] = useState('')
  const [labelActive, setLabelActive] = useState(false)

  const handleChangeChipsData = useCallback(() => {
    getValue(changeTagsHandler)(chipsData.current?.chipsData ?? [])
  }, [changeTagsHandler, chipsData.current])

  const updateTagsInput = useCallback(() => {
    if (getValue(value).length > 0) {
      tagsInput.current.focus()
      tagsInput.current.blur()
    }
  }, [tagsInput.current])

  useEffect(() => {
    chipsData.current = M.Chips.init(tags.current, {
      data: getValue(value),
      onChipAdd: handleChangeChipsData,
      onChipDelete: handleChangeChipsData,
    })
    setLabelId(tagsInput.current.id)
    updateTagsInput()

    return () => {
      chipsData.current.destroy()
    }
  }, [])

  const focusHadler = useCallback(() => {
    setLabelActive(true)
  }, [])

  const blurHadler = useCallback(event => {
    if (
      event.target.value.length === 0 &&
      chipsData.current?.chipsData?.length === 0
    ) {
      setLabelActive(false)
    }
  }, [])

  return `
    <div 
      class="chips tags" 
      ref="${useValue(tags)}"
    >
      <input 
        class="tags-input"
        onfocus="${useValue(focusHadler)}"
        onblur="${useValue(blurHadler)}"
        ref="${useValue(tagsInput)}"
      />
      ${
        labelId.length > 0 &&
        `<label 
          for="${labelId}"
          class="black-text${labelActive ? ' active' : ''}"
        >
          ${label}
        </label>`
      }
    </div>
  `
}
