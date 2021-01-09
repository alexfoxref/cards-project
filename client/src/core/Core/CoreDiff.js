import utils from '../utils'
import Core from './Core'
import CoreParser from './CoreParser'

const CoreDiff = {
  getDiff(prevArrObj, nextArrObj) {
    this.prevArrObj = prevArrObj
    this.nextArrObj = nextArrObj
    this.diff = []
    this.associatedIds = []
    this.prevMaps = {}
    this.nextMaps = {}

    this.prevMaps = this.getMaps(this.prevArrObj)
    this.nextMaps = this.getMaps(this.nextArrObj, true)

    this.compareAssociated()
    this.compareTypes()
    this.compareMaps()
    this.normalizeDiff()

    return this.diff
  },

  normalizeDiff() {
    this.diff = this.diff
      .sort((first, second) => {
        const firstPosition = Object.values(first)[0]?.position
        const secondPosition = Object.values(second)[0]?.position

        return firstPosition - secondPosition
      })
      .map(obj => {
        const objKey = Object.keys(obj)[0]
        delete obj[objKey]?.position

        return obj
      })
  },

  getMaps(arrObj, next) {
    if (!arrObj) return

    const maps = arrObj.reduce(
      (prev, obj, i) => {
        obj.position = i

        if (obj.props?.children) {
          delete obj.props.children
        }

        prev = this.saveId(prev, obj)
        prev = this.saveTypeAndChildren(prev, obj)
        prev = this.saveParent(prev, obj)
        prev = this.savePrevNeighborhood(prev, obj)
        prev = this.saveKey(prev, obj)

        if (next) {
          this.associateWithPrevMaps(obj)
        }

        return prev
      },
      {
        ids: {},
        types: {},
        parents: {},
        prevNeighborhoods: {},
        keys: {},
        typeAndChildren: {},
      }
    )

    return maps
  },

  saveId(prev, obj) {
    prev.ids[obj.id] = obj

    return prev
  },

  saveTypeAndChildren(prev, obj) {
    // const prev = {...prevObj}
    const type = obj.type
    const children = type ? undefined : obj.children
    const typeAndChildren = `${type}_${children}`

    if (!prev.types.hasOwnProperty(type)) {
      prev.types[type] = []
    }

    if (!prev.typeAndChildren.hasOwnProperty(typeAndChildren)) {
      prev.typeAndChildren[typeAndChildren] = []
    }

    prev.types[type].push(obj)
    prev.typeAndChildren[typeAndChildren].push(obj)

    return prev
  },

  saveParent(prev, obj) {
    // const prev = {...prevObj}
    const parent = obj.parent

    if (!prev.parents.hasOwnProperty(parent)) {
      prev.parents[parent] = []
    }

    const arr = prev.parents[parent]

    arr.push(obj)

    return prev
  },

  savePrevNeighborhood(prev, obj) {
    // const prev = {...prevObj}
    const prevNeighborhood = CoreParser.prevNeighborhoods[obj.id]

    if (!prev.prevNeighborhoods.hasOwnProperty(prevNeighborhood)) {
      prev.prevNeighborhoods[prevNeighborhood] = []
    }

    prev.prevNeighborhoods[prevNeighborhood].push(obj.id)

    return prev
  },

  saveKey(prev, obj) {
    // const prev = {...prevObj}
    const key = obj.props?.key

    // if (prev.keys[key]) {
    //   throw new Error(`key must be uniqum!`)
    // }

    if (key) {
      prev.keys[key] = obj
    }

    return prev
  },

  associateWithPrevMaps(obj) {
    const key = obj.props?.key

    if (key) {
      const prevObj = this.prevMaps.keys[key]

      if (prevObj) {
        this.associatedIds.push([prevObj.id, obj.id])
      }

      return
    }

    const type = obj.type
    const children = type ? undefined : obj.children

    const typeAndChildren = `${type}_${children}`
    const prevAssociatedIds = this.associatedIds.map(arr => arr[0])
    const prevObjArrAll = this.prevMaps?.typeAndChildren[typeAndChildren]

    if (!prevObjArrAll) return

    const prevObjArr = prevObjArrAll.filter(
      object => !prevAssociatedIds.includes(object.id)
    )

    if (prevObjArr?.length > 0) {
      const firstEqual = prevObjArr.find(object =>
        utils.isEqual(object.props, obj.props)
      )

      if (firstEqual) {
        this.associatedIds.push([firstEqual.id, obj.id])

        return
      }

      const equal = prevObjArr[0]

      this.associatedIds.push([equal.id, obj.id])

      return
    }

    return
  },

  compareAssociated() {
    this.associatedIds.forEach(arr =>
      this.associateElements(
        this.prevMaps.ids[arr[0]],
        this.nextMaps.ids[arr[1]]
      )
    )
  },

  compareTypes() {
    const newTypes = this.nextMaps.types
    const newTypesKeys = Object.keys(newTypes)
    const prevTypes = this.prevMaps?.types ?? []
    const prevTypesKeys = Object.keys(prevTypes)

    const allTypesKeys = prevTypesKeys.reduce(
      (prev, key) => {
        if (!prev.includes(key)) {
          prev.push(key)
        }

        return prev
      },
      [...newTypesKeys]
    )

    allTypesKeys.forEach(key => {
      if (!newTypesKeys.includes(key)) {
        prevTypes[key].forEach(prevElement =>
          this.associateElements(prevElement, null)
        )
      } else if (!prevTypesKeys.includes(key)) {
        newTypes[key].forEach(nextElement =>
          this.associateElements(null, nextElement)
        )
      } else {
        this.compareType(key)
      }
    })
  },

  compareType(comparingType) {
    const prevAssociatedIds = this.associatedIds.map(arr => arr[0])
    const nextAssociatedIds = this.associatedIds.map(arr => arr[1])
    const allAssociatedIds = prevAssociatedIds.reduce(
      (prev, id) => {
        if (!prev.includes(id)) {
          prev.push(id)
        }

        return prev
      },
      [...nextAssociatedIds]
    )

    const prevTypeArr = this.prevMaps.types[comparingType].filter(
      obj => !allAssociatedIds.includes(obj.id)
    )
    const nextTypeArr = this.nextMaps.types[comparingType].filter(
      obj => !allAssociatedIds.includes(obj.id)
    )

    const prevTypeArrLength = prevTypeArr.length
    const nextTypeArrLength = nextTypeArr.length

    if (nextTypeArrLength >= prevTypeArrLength) {
      return nextTypeArr.forEach((nextElement, i) => {
        const prevElement = prevTypeArr[i] ?? null

        this.associateElements(prevElement, nextElement)
      })
    } else {
      return prevTypeArr.forEach((prevElement, i) => {
        const nextElement = nextTypeArr[i] ?? null

        this.associateElements(prevElement, nextElement)
      })
    }
  },

  compareMaps() {
    const prevIds = Object.keys(this.prevMaps?.ids || {})
    const nextIds = Object.keys(this.nextMaps.ids)

    const allIds = prevIds.reduce(
      (prev, id) => {
        if (!prev.includes(id)) {
          prev.push(id)
        }

        return prev
      },
      [...nextIds]
    )

    allIds.forEach(id =>
      this.compareElements(
        this.prevMaps?.ids[id] || null,
        this.nextMaps.ids[id]
      )
    )
  },

  compareElements(prev, next) {
    const id = prev?.id ?? next.id
    const currentDiff = {}
    currentDiff[id] = {}

    if (!prev) {
      currentDiff[id] = next
      this.diff.push(currentDiff)

      return currentDiff
    }

    if (!next) {
      currentDiff[id] = null
      this.diff.push(currentDiff)

      return currentDiff
    }

    currentDiff[id].props = this.compareProps(prev, next)
    if (currentDiff[id].props === 'equal') {
      delete currentDiff[id].props
    }

    currentDiff[id].children = this.compareChildren(prev, next)
    if (currentDiff[id].children === 'equal') {
      delete currentDiff[id].children
    }

    currentDiff[id].parent = this.compareParents(prev, next)
    if (currentDiff[id].parent === 'equal') {
      delete currentDiff[id].parent
    }

    currentDiff[id].prevNeighborhood = this.compareNeighborhoods(prev, next)
    if (currentDiff[id].prevNeighborhood === 'equal') {
      delete currentDiff[id].prevNeighborhood
    }

    if (Object.keys(currentDiff[id]).length > 0) {
      this.diff.push(currentDiff)
    }
  },

  compareProps(prev, next) {
    const prevProps = { ...prev.props } ?? null
    const nextProps = { ...next.props } ?? null

    if (utils.isEqual(prevProps, nextProps)) {
      const contextObject = nextProps.contextObject

      if (
        !contextObject ||
        contextObject === Core.memory.get('contexts', 'contextObjects', prev.id)
      ) {
        return 'equal'
      }
    }

    if (!prevProps) {
      return { ...nextProps }
    }

    const prevPropsKeys = Object.keys(prevProps)

    if (!nextProps) {
      return prevPropsKeys.reduce((prevObj, key) => {
        prevObj[key] = null

        return prevObj
      }, {})
    }

    const nextPropsKeys = Object.keys(nextProps)

    const uniqPrevPropsKeys = prevPropsKeys.filter(
      key => !nextPropsKeys.includes(key)
    )
    const allKeys = [...uniqPrevPropsKeys, ...nextPropsKeys]

    return allKeys.reduce((prevObj, key) => {
      const prevValue = prevProps[key] ?? null
      const nextValue = nextProps[key] ?? null

      if (!utils.isEqual(prevValue, nextValue)) {
        prevObj[key] = nextValue
      }

      return prevObj
    }, {})
  },

  compareChildren(prev, next) {
    if (prev.type) {
      return 'equal'
    }

    const prevChildren = prev.children
    const nextChildren = next.children
    const children = !utils.isEqual(prevChildren, nextChildren)
      ? nextChildren
      : 'equal'

    return children
  },

  compareParents(prev, next) {
    const prevParent = prev.parent
    const nextParent = next.parent
    const parent = !utils.isEqual(nextParent, prevParent) ? nextParent : 'equal'

    return parent
  },

  compareNeighborhoods(prev, next) {
    const pNeighborhood = prev.prevNeighborhood
    const nNeighborhood = next.prevNeighborhood
    const prevNeighborhood = !utils.isEqual(nNeighborhood, pNeighborhood)
      ? nNeighborhood
      : 'equal'

    return prevNeighborhood
  },

  getPosition(next) {
    return next.position
  },

  associateElements(prev, next) {
    const prevId = prev?.id
    const nextId = next?.id

    if (!prevId || !nextId) return

    if (prev.custom) {
      next.props.children = next.children
    }

    this.nextMaps.ids[nextId].id = prevId
    this.nextMaps.ids[prevId] = this.nextMaps.ids[nextId]
    if (nextId !== prevId) delete this.nextMaps.ids[nextId]

    if (this.nextMaps.parents.hasOwnProperty(nextId)) {
      this.nextMaps.parents[nextId].forEach(obj => (obj.parent = prevId))
      this.nextMaps.parents[prevId] = this.nextMaps.parents[nextId]
      if (nextId !== prevId) delete this.nextMaps.parents[nextId]
    }

    if (this.nextMaps.prevNeighborhoods.hasOwnProperty(nextId)) {
      this.nextMaps.prevNeighborhoods[nextId].forEach(
        id => (this.nextMaps.ids[id].prevNeighborhood = prevId)
      )
      this.nextMaps.prevNeighborhoods[prevId] = this.nextMaps.prevNeighborhoods[
        nextId
      ]
      if (nextId !== prevId) delete this.nextMaps.prevNeighborhoods[nextId]
    }
  },
}

export default CoreDiff
