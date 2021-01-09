import utils from '../utils'
import Core from './Core'
import CoreComponentMap from './CoreComponentMap'
import { getValue, useValue } from './hooks'
import StringParser from './StringParser'

const CoreParser = {
  childrenSources: {},
  customSources: {},
  prevNeighborhoods: {},

  formatString(string) {
    let filteredArr
    const sortedArr = this.getSortedArr(string)
    filteredArr = this.getFilteredArr(sortedArr)

    if (this.currentCustomComponent) {
      const currentCustomComponent = this.currentCustomComponent.component

      filteredArr = this.setRootParent(filteredArr, currentCustomComponent)

      this.setCustomSource(currentCustomComponent, filteredArr)

      this.currentCustomComponent = null
    }

    return filteredArr
  },

  setCustomSource(component, arr) {
    this.customSources[component.id] = arr
  },

  getCustomSource(component) {
    return this.customSources[component.component.id]
  },

  setChildrenSource(component, arr) {
    const key = `${component.id}_${Date.now()}`

    if (arr.length > 0) this.childrenSources[component.id] = arr

    component.children = `<children${component.type}${''} source="${key}" />`
  },

  getChildrenSource(component) {
    const source = component.component.props.source.split('_')[0]
    let arr = this.childrenSources[source] ?? []

    arr = this.setRootParent(arr, component.component)

    const contextObject = component.component.props.contextObject
    const isCustom = obj => obj.custom
    const isChildren = obj => !!obj.type?.startsWith('children')

    if (contextObject) {
      arr.forEach(obj => {
        if (isCustom(obj) || isChildren(obj)) {
          const oldContextStr = obj.props.contextObject
          const oldContext = oldContextStr ? getValue(oldContextStr) : {}
          const currentContext = getValue(contextObject)
          const newContext = { ...oldContext, ...currentContext }

          Core.memory.set(
            'contexts',
            'contextObjects',
            obj.id,
            obj.props.contextObject
          )
          obj.props.contextObject = useValue(newContext)
        }
      })
    }

    return arr
  },

  removeChildrenSource(component) {
    const prevSource = component.prevChildrenSource.split('_')[0]
    const currentSource = component.component.props.source.split('_')[0]
    const isRouteChildren = component.component.type === 'childrenRoute'

    if (prevSource !== currentSource && !isRouteChildren) {
      delete this.childrenSources[prevSource]
    }
  },

  getSortedArr(string) {
    const array = this.formatStringToArrayOfObjects(string)
    const sortedArr = this.sortTopLevelObjects(array)

    return sortedArr.map(obj => ({ ...obj, parent: obj.parent?.id }))
  },

  saveCustomObjChildren(customObj, sortedArr) {
    const customChildren = sortedArr
      .filter(obj => obj.custom && obj.id !== customObj.id)
      .map(obj => obj.id)
    const childrenArrIds = sortedArr
      .filter(obj => obj.parent === customObj.id)
      .map(obj => obj.id)

    const customObjChildrenIds = sortedArr.reduce((prevArr, obj) => {
      if (customChildren.includes(obj.parent)) {
        customChildren.push(obj.id)

        return prevArr
      }

      if (prevArr.includes(obj.parent)) {
        prevArr.push(obj.id)
      }

      return prevArr
    }, childrenArrIds)

    const notChildrenArr = []

    const childrenSources = sortedArr.filter(obj => {
      if (customObjChildrenIds.includes(obj.id)) return true

      notChildrenArr.push(obj)

      return false
    })

    this.setChildrenSource(customObj, childrenSources)

    return notChildrenArr
  },

  getFilteredArr(sortedArr) {
    const customArr = sortedArr.filter(obj => obj.custom)
    let prevNotChildrenArr = sortedArr
    let currentNotChildrenArr = []

    for (let i = 0; i < customArr.length; i++) {
      currentNotChildrenArr = this.saveCustomObjChildren(
        customArr[i],
        prevNotChildrenArr
      )
      prevNotChildrenArr = currentNotChildrenArr
    }

    return prevNotChildrenArr
  },

  setRootParent(arr, component) {
    if (component.id === Core.mainContainer) return arr

    if (arr.length === 0) return []

    const rootParent = arr[0].parent
    const normalParent = this.getNormalParent(component.parent)

    component.parent = normalParent

    arr.forEach(element => {
      if (element.parent === rootParent) {
        element.parent = normalParent
      }
    })

    this.setPrevNeighborhoods(arr, component)

    return arr
  },

  getNormalParent(id) {
    let parent = id

    if (!parent) {
      parent = Core.mainContainer
    } else {
      const parentComponent = CoreComponentMap.getComponentById(parent)

      if (parentComponent.isCustom || parentComponent.isChildren) {
        parent = this.getNormalParent(parentComponent.component.parent)
      }
    }

    return parent
  },

  setPrevNeighborhoods(arrObj, component) {
    const rootParent = arrObj[0].parent
    const rootObjects = []
    const newArr = arrObj.reduce((prevArr, obj) => {
      if (obj.parent === rootParent) {
        const rootObjectsLength = rootObjects.length
        const prevObj =
          rootObjectsLength === 0
            ? { id: component?.prevNeighborhood ?? undefined }
            : rootObjects[rootObjectsLength - 1]

        obj.prevNeighborhood = prevObj.id

        this.prevNeighborhoods[obj.id] = obj.prevNeighborhood
        rootObjects.push(obj)

        const newPrevArr = prevArr.filter(object => object.id !== obj.id)

        return newPrevArr
      }

      return prevArr
    }, arrObj)

    if (newArr.length > 0) {
      this.setPrevNeighborhoods(newArr)
    }
  },

  formatStringToArrayOfObjects(string) {
    const parsingObj = StringParser.parseStringToObject({
      string,
      customTypeTemplates: [/^[A-Z]/],
    })
    const { tags, textNodes } = parsingObj

    return [...tags, ...textNodes]
  },

  sortTopLevelObjects(arrObjects) {
    return arrObjects.sort(
      (firstObj, secondObj) => firstObj.position - secondObj.position
    )
  },
}

export default CoreParser
