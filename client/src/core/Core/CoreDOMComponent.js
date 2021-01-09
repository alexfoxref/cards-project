import utils from '../utils'
import CoreComponentMap from './CoreComponentMap'
import { getValue } from './hooks'

const setAttributes = (domElement, component) => {
  const id = component.id
  const props = component.props
  const excludeKeys = ['children', 'key']

  for (const key in props) {
    if (props.hasOwnProperty(key) && !excludeKeys.includes(key)) {
      if (key === 'props') {
        const newProps = getValue(props[key])

        setAttributes(domElement, { id, props: newProps })
      } else if (key === 'ref') {
        const ref = getValue(props[key])

        ref.current = domElement
      } else if (key.startsWith('on')) {
        const eventName = key.replace(/^on/, '')
        const value = props[key]
        const func = utils.isFunction(value) ? value : getValue(value)

        const prevFunc = CoreComponentMap.getInstanceEvent(id, eventName)

        if (prevFunc) {
          domElement.removeEventListener(eventName, prevFunc)
        }

        CoreComponentMap.addInstanceEvent(id, eventName, func)
        domElement.addEventListener(eventName, func)
      } else {
        if (key === 'value') {
          domElement.value = props[key]
        }

        domElement.setAttribute(key, props[key])

        const value = utils.normalizeValue(props[key])

        if (value === null || value === undefined) {
          domElement.removeAttribute(key)
        }

        if ((key === 'disabled' || key === 'selected') && !value) {
          domElement.removeAttribute(key)
        }
      }
    }
  }
}

let focusElement = null

export default class CoreDOMComponent {
  constructor(component) {
    this.component = component

    this.isTextNode = !this.component.type
  }

  focus = () => {
    focusElement = this.hostNode
    this.hostNode.focus()
  }

  mountComponent(container) {
    const domElement = !this.isTextNode
      ? document.createElement(this.component.type)
      : document.createTextNode(this.component.props.children)

    setAttributes(domElement, this.component)

    const prevElement = this.component.prevNeighborhood
      ? CoreComponentMap.getInstanceById(this.component.prevNeighborhood)
          .hostNode
      : this.component.prevNeighborhood

    this.prevNeighborhood = prevElement

    if (!this.component.prevNeighborhood) {
      container.prepend(domElement)
    } else {
      prevElement.after(domElement)
    }

    this.hostNode = domElement
    this.hostNode.addEventListener('focus', this.focus)

    return domElement
  }

  unmountComponent() {
    CoreComponentMap.removeInstanceById(this.component.id)
    this.hostNode.removeEventListener('focus', this.focus)

    const events = CoreComponentMap.getInstanceEvents(this.component.id)

    if (events) {
      Object.keys(events).forEach(eventName => {
        this.hostNode.removeEventListener(eventName, events[eventName])
      })
    }

    return this.hostNode.parentNode.removeChild(this.hostNode)
  }

  updateComponent(diff) {
    const { props, children, parent, prevNeighborhood } = diff

    if (props) {
      setAttributes(this.hostNode, { id: this.component.id, props })
    }

    if (children && this.isTextNode) {
      this.hostNode.nodeValue = children
    }

    if (parent || diff.hasOwnProperty('prevNeighborhood')) {
      const parentInstance = parent
        ? CoreComponentMap.getInstanceById(parent).hostNode
        : this.component.container

      if (diff.hasOwnProperty('prevNeighborhood')) {
        if (!prevNeighborhood) {
          parentInstance.prepend(this.hostNode)
        } else {
          const prevNeighborhoodInstance = CoreComponentMap.getInstanceById(
            prevNeighborhood
          ).hostNode

          this.prevNeighborhood = prevNeighborhoodInstance

          prevNeighborhoodInstance.after(this.hostNode)
        }
      } else {
        if (!this.prevNeighborhood) {
          parentInstance.prepend(this.hostNode)
        } else {
          this.prevNeighborhood.after(this.hostNode)
        }
      }
    }

    if (focusElement === this.hostNode) {
      this.hostNode.focus()
    }
  }
}
