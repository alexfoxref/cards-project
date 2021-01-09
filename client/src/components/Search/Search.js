import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useValue,
} from '../../core/Core'
import { useAppStore } from '../../hooks'
import { selectOptions } from '../../store/constants'

export const Search = () => {
  const {
    card: { cards },
    search: { param, value },
    setSearchValue,
    setSearchData,
  } = useAppStore()

  useEffect(() => {
    setSearchData(cards, param, value)
  }, [cards, param, value])

  const timer = useRef(true)
  const getSearch = useCallback(
    event => {
      if (timer.current) {
        timer.current = false
        setTimeout(() => {
          setSearchValue(event.target.value)
          timer.current = true
        }, 1000)
      }
    },
    [timer.current]
  )

  const options = useMemo(() => {
    return [
      {
        value: selectOptions.all,
        title: 'Везде',
        selected: param === selectOptions.all,
      },
      {
        value: selectOptions.title,
        title: 'Название',
        selected: param === selectOptions.title,
      },
      {
        value: selectOptions.description,
        title: 'Описание',
        selected: param === selectOptions.description,
      },
      {
        value: selectOptions.tags,
        title: 'Тэги',
        selected: param === selectOptions.tags,
      },
      {
        value: selectOptions.creator,
        title: 'Автор',
        selected: param === selectOptions.creator,
      },
    ]
  }, [param])

  return `
    <div class="row">
      <div class="col s8">
        <Input 
          id="search"
          oninput="${useValue(getSearch)}"
          value="${value}"
          label="Поиск"
          classes="create"
        />
      </div>
      <div class="col s4">
        <Select 
          label="Категория поиска"
          options="${useValue(options)}"
        />
      </div>
    </div>
  `
}
