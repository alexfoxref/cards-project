import Core from '../Core'
import CoreComponentMap from '../CoreComponentMap'
import useChildren from './useChildren'
import useState from './useState'
import { getValue, useValue } from './useValue'

const createContext = value => {
  const count = Core.memory.get('contexts', 'count', 'count') ?? 0
  const contextName = `Context_${count}`
  const contextValue = { value }

  Core.memory.set('contexts', 'count', 'count', count + 1)
  Core.memory.set('contexts', contextName, contextName, contextValue)

  const ContextComponent = () => {
    return useChildren(children => children)
  }

  Core.memory.set('components', contextName, contextName, ContextComponent)

  return contextName
}

const useContext = Context => {
  const id = Core.currentComponentId
  const component = CoreComponentMap.getComponentById(id)
  const contextObjectStr = component.component.props.contextObject
  const contextObject = contextObjectStr
    ? getValue(component.component.props.contextObject)
    : { [Context]: null }
  const count = Core.memory.get('context', id, 'count')

  Core.memory.set('context', id, 'count', count + 1)

  return contextObject[Context]
}

export { createContext, useContext }
