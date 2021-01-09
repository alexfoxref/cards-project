import CoreDOMComponent from './CoreDOMComponent'
import CoreComponentMap from './CoreComponentMap'
import Core, { getComponent } from './'
import CoreParser from './CoreParser'
import CoreDiff from './CoreDiff'
import { callEffects, clearComponent } from './hooks'

const mountCoreComponent = component => new CoreDOMComponent(component)

const mountElement = object => Core.render([object])

export default class CoreComponent {
  constructor(element) {
    this.component = element

    const isCustom = this.component.custom
    if (isCustom) {
      this.isCustom = isCustom
      const comp = this

      this.effecting = new Proxy(
        { value: false },
        {
          set(target, prop, value, receiver) {
            if (prop === 'value' && value === false) {
              if (comp.needUpdate) {
                comp.needUpdate = false
                comp.updateComponent()
              }
            }

            return Reflect.set(target, prop, value, receiver)
          },
        }
      )
    }
    const isChildren = this.component.type?.startsWith('children')
    if (isChildren) this.isChildren = isChildren
    const isContext = this.component.type?.startsWith('Context')
    if (isContext) this.isContext = isContext
  }

  mountCustomComponent() {
    // console.log('mountCustomComponent', this.component)
    this.effecting.value = true

    Core.currentComponentId = this.component.id

    const string = getComponent(this.component)

    // this.isEmpty = string !== '' ? false : true

    CoreParser.currentCustomComponent = this

    Core.render(string, this.component.container)

    this.prevString = string
    this.prevObjects = CoreParser.getCustomSource(this)

    callEffects(this)
    this.effecting.value = false

    // console.log('end mountCustomComponent', this.component)
  }

  mountChildrenComponent() {
    // console.log('mountChildrenComponent', this.component)

    this.prevChildren = CoreParser.getChildrenSource(this)

    Core.render(this.prevChildren)

    // console.log('end mountChildrenComponent', this.component)
  }

  mountComponent(container) {
    CoreComponentMap.addComponent(this)

    if (this.isCustom) {
      return this.mountCustomComponent()
    }

    if (this.isChildren) {
      return this.mountChildrenComponent()
    }

    return this.getInitialMount(container)
  }

  getInitialMount(container) {
    this.renderedComponent = mountCoreComponent(this.component)

    CoreComponentMap.addInstance(this)

    this.component.instance = this.renderedComponent.mountComponent(container)

    return this.component.instance
  }

  updateCustomComponent(nextString) {
    this.effecting.value = true

    CoreParser.currentCustomComponent = this

    const nextObjects = CoreParser.formatString(nextString)
    const diff = CoreDiff.getDiff(this.prevObjects, nextObjects)

    this.prevString = nextString
    this.prevObjects = CoreParser.getCustomSource(this)

    this.updateComponentWithDiff(diff)

    callEffects(this)
    this.effecting.value = false

    // console.log('end updateCustomComponent', this.component)
  }

  updateComponentWithDiff(diff) {
    const mountDiff = diff.filter(
      obj => !CoreComponentMap.getComponentById(Object.keys(obj)[0])
    )
    const mountDiffIds = mountDiff.map(obj => Object.keys(obj)[0])
    const anotherDiff = diff.filter(
      obj => !mountDiffIds.includes(Object.keys(obj)[0])
    )

    mountDiff.forEach(obj => {
      const objId = Object.keys(obj)[0]
      const object = obj[objId]

      mountElement(object)
    })

    anotherDiff.forEach(obj => {
      const objId = Object.keys(obj)[0]
      const object = obj[objId]
      const component = CoreComponentMap.getComponentById(objId)

      if (!object) {
        component.unmountComponent()
      } else {
        component.updateComponent(object)
      }
    })
  }

  unmountComponent() {
    const id = this.component.id
    // console.log('unmountComponent', this.component)

    CoreComponentMap.removeComponentById(id)

    if (this.isCustom) {
      return this.unmountCustomComponent()
    }

    if (this.isChildren) {
      return this.unmountChildrenComponent()
    }

    const instance = CoreComponentMap.getInstanceById(id)

    return instance.unmountComponent()
  }

  unmountCustomComponent() {
    // console.log('unmountCustomComponent', this.component)

    clearComponent(this.component.id)

    if (this.prevObjects) {
      this.prevObjects.forEach(obj => {
        CoreComponentMap.getComponentById(obj.id).unmountComponent()
      })
    }

    // console.log('end unmountCustomComponent', this.component)
  }

  unmountChildrenComponent() {
    // console.log('unmountChildrenComponent', this.component)

    this.prevChildren.forEach(obj => {
      CoreComponentMap.getComponentById(obj.id).unmountComponent()
    })

    // console.log('end unmountChildrenComponent', this.component)
  }

  updateComponent(diff) {
    if (diff) {
      const { parent, prevNeighborhood, props, children } = diff

      this.component.parent = parent ? parent : this.component.parent
      if (diff.hasOwnProperty('prevNeighborhood')) {
        CoreComponentMap.updateNeighborhoods(this, prevNeighborhood)
      }
      if (this.isChildren) this.prevChildrenSource = this.component.props.source
      this.component.props = props
        ? { ...this.component.props, ...props }
        : this.component.props
      this.component.children = children ?? this.component.children
    }

    if (this.isCustom) {
      Core.currentComponentId = this.component.id

      const string = getComponent(this.component)

      this.updateCustomComponent(string)

      return
    }

    if (this.isChildren) {
      this.updateChildrenComponent()

      return
    }

    const id = this.component.id
    const instance = CoreComponentMap.getInstanceById(id)

    instance.updateComponent(diff)

    return
  }

  updateChildrenComponent() {
    // console.log('updateChildrenComponent', this.component)

    this.nextChildren = CoreParser.getChildrenSource(this)

    const childrenDiff = CoreDiff.getDiff(this.prevChildren, this.nextChildren)

    CoreParser.removeChildrenSource(this)

    this.prevChildren = this.nextChildren

    this.updateComponentWithDiff(childrenDiff)

    // console.log('end updateChildrenComponent', this.component)
  }
}
