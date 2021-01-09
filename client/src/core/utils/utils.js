const utils = {
  startId: 1,

  uuid() {
    return this.startId++
  },

  isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  },

  isString(str) {
    return typeof str === 'string'
  },

  isArray(arr) {
    return Array.isArray(arr)
  },

  isFunction(func) {
    return typeof func === 'function'
  },

  isRegExp(obj) {
    return obj instanceof RegExp
  },

  isEqual(value1, value2) {
    try {
      if (this.isRegExp(value1)) {
        if (!this.isRegExp(value2)) return false

        return value1.toString() === value2.toString()
      }

      if (this.isObject(value1)) {
        if (!this.isObject(value2)) return false
        if (Object.keys(value2).length !== Object.keys(value1).length)
          return false

        for (const key in value1) {
          if (value1.hasOwnProperty(key)) {
            if (
              !value2.hasOwnProperty(key) ||
              !this.isEqual(value1[key], value2[key])
            )
              return false
          }
        }

        return true
      }

      if (this.isArray(value1)) {
        if (!this.isArray(value2)) return false
        if (value1.length !== value2.length) return false

        for (let i = 0; i < value1.length; i++) {
          if (!this.isEqual(value1[i], value2[i])) return false
        }

        return true
      }
    } catch {
      console.log('Limited call stack size')
    }

    return value1 === value2
  },

  copy(value) {
    return new Promise(resolve => {
      if (this.isRegExp(value)) {
        const newValue = new RegExp(
          value.toString().replace(/^\//, '').replace(/\/$/, '')
        )

        resolve(newValue)
      } else if (this.isObject(value)) {
        const promises = Object.values(value).map(val => this.copy(val))

        Promise.all(promises).then(values => {
          const newValue = {}

          Object.keys(value).forEach((key, i) => {
            newValue[key] = values[i]
          })

          resolve(newValue)
        })
      } else if (this.isArray(value)) {
        const promises = value.map(val => this.copy(val))

        Promise.all(promises).then(resolve)
      } else {
        resolve(value)
      }
    })
  },

  normalizeValue(str) {
    if (!str) return false

    switch (str) {
      case 'true':
        return true
      case 'false':
        return false
      case 'null':
        return null
      case 'undefined':
        return undefined
      case 'NaN':
        return NaN
      default:
        return str
    }
  },
}

export default utils
