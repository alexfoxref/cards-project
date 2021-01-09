import Core from '../index'

class Ref {
  #current = null
  #id = null

  constructor(initialValue, id) {
    this.#current = initialValue
    this.#id = id
  }

  get current() {
    return this.#current
  }

  set current(value) {
    this.#current = value

    const currentComponentRefs = Core.memory.get('refs', this.#id, 'refs')
    const count = Core.memory.get('refs', this.#id, `count`)
    const newRef = { ...currentComponentRefs[count], ...this }
    const newRefs = [...currentComponentRefs]

    newRefs[count] = newRef
    Core.memory.set('refs', this.#id, 'refs', newRefs)
  }
}

const useRef = initialValue => {
  const id = Core.currentComponentId
  const currentComponentRefs = Core.memory.get('refs', id, 'refs') ?? []
  const count = Core.memory.get('refs', id, `count`)
  const prevRef = currentComponentRefs[count]

  Core.memory.set('refs', id, `count`, count + 1)

  if (prevRef) {
    return currentComponentRefs[count]
  }

  const newRef = new Ref(initialValue, id)
  const newRefs = [...currentComponentRefs]

  newRefs[count] = newRef
  Core.memory.set('refs', id, 'refs', newRefs)

  return newRef
}

export default useRef
