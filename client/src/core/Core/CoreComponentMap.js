import CoreParser from './CoreParser'

const CoreComponentMap = {
  mapComponentById: {},
  mapInstanceById: {},
  mapPositionById: {},
  mapInstanceEventsById: {},
  mapNeighborhoodsById: new Map([]),

  getLastRootChild(component) {
    const funcs = {
      custom: component => CoreParser.getCustomSource(component),
      children: component => CoreParser.getChildrenSource(component),
      empty: null,
    }
    const func = component.isCustom
      ? funcs.custom
      : component.isChildren
      ? funcs.children
      : funcs.empty

    if (!func) {
      return component.component.id
    }

    const arrObj = func(component)

    let lastRootChild = undefined

    if (arrObj.length > 0) {
      const rootParent = arrObj[0].parent
      const rootChildren = arrObj.filter(obj => obj.parent === rootParent)
      const lastRootChildId = rootChildren[rootChildren.length - 1].id
      const lastRootChildComponent = this.mapComponentById[lastRootChildId]

      lastRootChild = this.getLastRootChild(lastRootChildComponent)
    }

    return lastRootChild
  },

  getNormalPrevNeighborhood(id) {
    let prevNeighborhood = id

    if (prevNeighborhood) {
      const prevNeighborhoodComponent = this.mapComponentById[prevNeighborhood]

      if (
        prevNeighborhoodComponent.isCustom ||
        prevNeighborhoodComponent.isChildren
      ) {
        const lastRootChild = this.getLastRootChild(prevNeighborhoodComponent)

        prevNeighborhoodComponent.lastRootChild = lastRootChild

        if (!lastRootChild) {
          prevNeighborhood = this.getNormalPrevNeighborhood(
            prevNeighborhoodComponent.component.prevNeighborhood
          )
        } else {
          prevNeighborhood = this.getNormalPrevNeighborhood(
            prevNeighborhoodComponent.lastRootChild
          )
        }

        prevNeighborhoodComponent.component.prevNeighborhood = prevNeighborhood
      }
    }

    return prevNeighborhood
  },

  setNeighborhoods(component) {
    const prevNeighborhood = this.getNormalPrevNeighborhood(
      component.component.prevNeighborhood
    )

    component.component.prevNeighborhood = prevNeighborhood

    if (!component.isCustom && !component.isChildren) {
      this.mapNeighborhoodsById.set(component.component.id, {
        prev: prevNeighborhood,
        next: null,
      })

      if (prevNeighborhood) {
        const prevCompNeighborhoods = this.mapNeighborhoodsById.get(
          prevNeighborhood
        )

        this.mapNeighborhoodsById.set(prevNeighborhood, {
          ...prevCompNeighborhoods,
          next: component.component.id,
        })
      }
    }
  },

  updateNeighborhoods(component, prevNeighborhood) {
    const newPrevNeighborhood = this.getNormalPrevNeighborhood(prevNeighborhood)

    if (!component.isCustom && !component.isChildren) {
      const oldNeighborhoods = this.mapNeighborhoodsById.get(
        component.component.id
      )

      if (oldNeighborhoods.prev) {
        const prevCompNeighborhoods = this.mapNeighborhoodsById.get(
          oldNeighborhoods.prev
        )

        this.mapNeighborhoodsById.set(oldNeighborhoods.prev, {
          ...prevCompNeighborhoods,
          next: oldNeighborhoods.next,
        })
      }

      if (oldNeighborhoods.next) {
        const nextCompNeighborhoods = this.mapNeighborhoodsById.get(
          oldNeighborhoods.next
        )

        this.mapNeighborhoodsById.set(oldNeighborhoods.next, {
          ...nextCompNeighborhoods,
          prev: oldNeighborhoods.prev,
        })

        this.mapComponentById[
          oldNeighborhoods.next
        ].component.prevNeighborhood = oldNeighborhoods.prev
      }

      if (newPrevNeighborhood) {
        const newPrevNeighborhoods = this.mapNeighborhoodsById.get(
          newPrevNeighborhood
        )

        if (newPrevNeighborhoods.next) {
          const newNextCompNeighborhoods = this.mapNeighborhoodsById.get(
            newPrevNeighborhoods.next
          )

          this.mapNeighborhoodsById.set(newPrevNeighborhoods.next, {
            ...newNextCompNeighborhoods,
            prev: component.component.id,
          })

          this.mapComponentById[
            newPrevNeighborhoods.next
          ].component.prevNeighborhood = component.component.id
        }

        this.mapNeighborhoodsById.set(newPrevNeighborhood, {
          ...newPrevNeighborhoods,
          next: component.component.id,
        })

        this.mapNeighborhoodsById.set(component.component.id, {
          prev: newPrevNeighborhood,
          next: newPrevNeighborhoods.next,
        })
      }
    }

    component.component.prevNeighborhood = newPrevNeighborhood
  },

  addComponent(component) {
    this.setNeighborhoods(component)
    this.addComponentById(component)
  },

  addInstance(component) {
    this.addInstanceById(component)
  },

  addById(map, id, value) {
    map[id] = value
  },

  addComponentById(component) {
    this.addById(this.mapComponentById, component.component.id, component)
  },

  addInstanceById(component) {
    this.addById(
      this.mapInstanceById,
      component.component.id,
      component.renderedComponent
    )
  },

  getById(map, id) {
    return map[id]
  },

  getComponentById(id) {
    return this.getById(this.mapComponentById, id)
  },

  removeComponentById(id) {
    const component = this.mapComponentById[id]

    if (!component.isCustom && !component.isChildren) {
      const neighborhoods = this.mapNeighborhoodsById.get(id)

      if (neighborhoods.prev) {
        const prevNeighborhoods = this.mapNeighborhoodsById.get(
          neighborhoods.prev
        )

        this.mapNeighborhoodsById.set(neighborhoods.prev, {
          ...prevNeighborhoods,
          next: neighborhoods.next,
        })
      }

      if (neighborhoods.next) {
        const nextNeighborhoods = this.mapNeighborhoodsById.get(
          neighborhoods.next
        )

        this.mapNeighborhoodsById.set(neighborhoods.next, {
          ...nextNeighborhoods,
          prev: neighborhoods.prev,
        })

        this.mapComponentById[neighborhoods.next].component.prevNeighborhood =
          neighborhoods.prev
      }

      this.mapNeighborhoodsById.delete(id)
    }

    delete this.mapComponentById[id]
  },

  getInstanceById(id) {
    return this.getById(this.mapInstanceById, id)
  },

  removeInstanceById(id) {
    delete this.mapInstanceById[id]
    this.removeInstanceEvents(id)
  },

  addInstanceEvent(id, eventName, func) {
    if (!this.mapInstanceEventsById[id]) {
      this.mapInstanceEventsById[id] = {}
    }
    this.mapInstanceEventsById[id][eventName] = func
  },

  getInstanceEvent(id, eventName) {
    const events = this.mapInstanceEventsById[id]

    if (!events) return null

    return this.mapInstanceEventsById[id][eventName]
  },

  getInstanceEvents(id) {
    return this.mapInstanceEventsById[id]
  },

  removeInstanceEvent(id, eventName) {
    delete this.mapInstanceEventsById[id][eventName]
  },

  removeInstanceEvents(id) {
    delete this.mapInstanceEventsById[id]
  },
}

export default CoreComponentMap
