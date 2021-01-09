import Core from '../index'
import CoreComponentMap from '../CoreComponentMap'
import utils from '../../utils'

const useState = initialValue => {
  const currentComponent = CoreComponentMap.getComponentById(
    Core.currentComponentId
  )
  const id = Core.currentComponentId
  const currentComponentState = Core.memory.get('states', id, 'states') ?? []
  const count = Core.memory.get('states', id, `count`)
  const prevState = currentComponentState[count]

  if (prevState) {
    Core.memory.set('states', id, `count`, count + 1)

    return currentComponentState[count]
  }

  const setValue = value => {
    const prevState = Core.memory.get('states', id, 'states')

    if (!prevState) return

    const prevValue = prevState[count][0]
    const newValue = utils.isFunction(value) ? value(prevValue) : value

    if (utils.isEqual(prevValue, newValue)) return

    currentComponent.needUpdate = true

    const newState = prevState.map((arr, i) => {
      if (i === count) {
        const newArr = [...arr]

        newArr[0] = newValue

        return newArr
      }

      return arr
    })

    Core.memory.set('states', id, 'states', newState)

    if (!currentComponent.effecting.value) {
      currentComponent.needUpdate = false
      currentComponent.updateComponent()
    }
  }

  const realInitialValue = utils.isFunction(initialValue)
    ? initialValue()
    : initialValue
  const newState = [...currentComponentState, [realInitialValue, setValue]]

  Core.memory.set('states', id, 'states', newState)
  Core.memory.set('states', id, `count`, count + 1)

  return [realInitialValue, setValue]
}

export default useState
