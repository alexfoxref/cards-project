export default class CoreMemory {
  #memory = {}

  constructor(obj) {
    this.#memory = { ...this.#memory, ...obj }
  }

  get(field, id, name) {
    return this.#memory[field] && this.#memory[field][id]
      ? this.#memory[field][id][name]
      : undefined
  }

  set(field, id, name, value) {
    if (!this.#memory[field]) {
      this.#memory[field] = {}
    }

    if (!this.#memory[field][id]) {
      this.#memory[field][id] = {}
    }

    if (!this.#memory[id]) {
      this.#memory[id] = []
    }

    this.#memory[id].push(field)
    this.#memory[field][id][name] = value

    return value
  }

  delete(field, id, name) {
    if (field && id && name) {
      delete this.#memory[field][id][name]
    } else if (field && id && !name) {
      delete this.#memory[field][id]
    } else if (field && !id) {
      delete this.#memory[field]
    }
  }

  clear(id) {
    this.clearFields(this.#memory[id], id)

    delete this.#memory[id]
  }

  clearFields(fields, id) {
    fields.forEach(field => {
      delete this.#memory[field][id]
    })
  }
}
