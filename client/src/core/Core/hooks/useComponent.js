import Core from '../'
import { clearEffects } from './useEffect'
import { getValue, useValue } from './useValue'

const useComponent = Components => {
  for (const key in Components) {
    Core.memory.set('components', key, key, Components[key])
  }
}

const getNewChildren = Component => {
  return Component.props.children
    .split('"')
    .map((str, i, arr) => {
      let newStr = str

      if (i === arr.length - 2) {
        newStr = `${str.split('_')[0]}_${Date.now()}`
      }

      return newStr
    })
    .join('"')
}

const stringWithContext = (string, component) => {
  const isContext = component.type.startsWith('Context')
  const contextObject = component.props.contextObject

  if (isContext) {
    const oldContext = contextObject ? getValue(contextObject) : {}
    const value =
      component.props.hasOwnProperty('value') &&
      component.props.value !== 'undefined'
        ? component.props.value
        : Core.memory.get('contexts', component.type, component.type).value
    const currentContext = { [component.type]: getValue(value) }
    const newContext = { ...oldContext, ...currentContext }

    return string.replace(
      /(<([A-Z]|children)[^\s\/>]+)(?!\scontextObject)/g,
      `$1 contextObject="${useValue(newContext)}"`
    )
  } else {
    if (contextObject) {
      return string.replace(
        /(<([A-Z]|children)[^\s\/>]+)(?!\scontextObject)/g,
        `$1 contextObject="${contextObject}"`
      )
    }
  }

  return string
}

const getComponent = Component => {
  Component.props.children = getNewChildren(Component)

  const id = Component.id

  Core.memory.set('states', id, `count`, 0)
  Core.memory.set('effects', id, `count`, 0)
  Core.memory.set('refs', id, `count`, 0)
  Core.memory.set('memos', id, `count`, 0)
  Core.memory.set('values', id, `count`, 0)
  Core.memory.set('context', id, 'count', 0)

  let string = Core.memory.get(
    'components',
    Component.type,
    Component.type
  )(Component.props)

  // каждый раз строка чистая от контекста - невозможно совмещать контексты
  string = stringWithContext(string, Component)

  return string
}

const clearComponent = id => {
  clearEffects(id)

  Core.memory.clear(id)
}

export { useComponent, getComponent, clearComponent }
