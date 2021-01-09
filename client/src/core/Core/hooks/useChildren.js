import Core from '../Core'
import CoreComponentMap from '../CoreComponentMap'
import CoreParser from '../CoreParser'

const useChildren = func => {
  const currentComponent = CoreComponentMap.getComponentById(
    Core.currentComponentId
  )
  const children = currentComponent.component.props.children
  const childrenSource = children
    .split('"')
    .filter((_, i, arr) => i === arr.length - 2)[0]
    .split('_')[0]
  const childrenArr = CoreParser.childrenSources[childrenSource]

  if (!childrenArr || childrenArr.length === 0) return ''

  return func(children)
}

export default useChildren
