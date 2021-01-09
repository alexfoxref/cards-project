import CoreComponent from './CoreComponent'
import CoreDOMComponent from './CoreDOMComponent'
import CoreMemory from './CoreMemory'
import CoreParser from './CoreParser'
import CoreComponentMap from './CoreComponentMap'
import utils from '../utils'

const mountComponent = element => {
  const parent = element.parent || Core.mainContainer

  element.container = CoreComponentMap.getInstanceById(parent).hostNode

  const parentContainer = element.container
  const component = new CoreComponent(element)
  const childrenContainer = component.mountComponent(parentContainer)

  return childrenContainer
}

const getElementList = string => {
  if (!utils.isString(string)) {
    return false
  }

  const arrObj = CoreParser.formatString(string)

  return arrObj.map(Core.createElement)
}

const mountElementList = income => {
  let elementList = getElementList(income)

  if (!elementList) {
    if (!utils.isArray(income)) {
      throw new Error(
        `Type error. Type of ${income} must be 'String' or 'Array'`
      )
    }

    elementList = income.map(Core.createElement)
  }

  return mountElements(elementList)
}

const mountElements = elementList => {
  elementList.forEach(element => mountComponent(element))
}

const Core = {
  currentComponentId: utils.uuid(),

  createElement({
    type,
    props,
    children,
    parent,
    id,
    custom,
    prevNeighborhood,
  }) {
    const element = {
      type,
      props: props || {},
      parent,
      id,
      prevNeighborhood,
    }

    if (custom) {
      element.custom = custom
    }

    if (children) {
      element.props.children = children
    }

    return element
  },

  memory: new CoreMemory(),

  initMainContainer(container) {
    const mainContainerObj = {
      id: this.currentComponentId,
      type: 'div',
      parent: undefined,
      prevNeighborhood: undefined,
    }
    const mainContainerElement = Core.createElement(mainContainerObj)

    mainContainerElement.container = document.body

    const mainContainerComponent = new CoreComponent(mainContainerElement)

    CoreComponentMap.addComponent(mainContainerComponent)

    const mainContainerInstance = new CoreDOMComponent(
      mainContainerComponent.component
    )
    mainContainerComponent.renderedComponent = mainContainerInstance

    CoreComponentMap.addInstance(mainContainerComponent)

    mainContainerInstance.hostNode = container
    mainContainerComponent.component.instance = container

    this.mainContainer = mainContainerObj.id

    CoreParser.currentCustomComponent = mainContainerComponent
  },

  render(component, container) {
    if (!this.mainContainer) {
      this.initMainContainer(container)
    }

    return mountElementList(component)
  },
}

export default Core
