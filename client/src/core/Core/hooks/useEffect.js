import Core from '../index'
import utils from '../../utils'

const useEffect = (callback, dependencies) => {
  const id = Core.currentComponentId
  const currentComponentEffects =
    Core.memory.get('effects', id, 'effects') ?? []
  const deps = Core.memory.get('effects', id, `deps`) ?? []
  const count = Core.memory.get('effects', id, `count`)
  const oldDeps = deps[count]
  const newEffects = [...currentComponentEffects]
  const newDeps = [...deps]

  newEffects[count] = callback
  newDeps[count] = dependencies

  Core.memory.set('effects', id, 'effects', newEffects)
  Core.memory.set('effects', id, `deps`, newDeps)
  Core.memory.set('effects', id, `count`, count + 1)

  if (dependencies) {
    if (!utils.isArray(dependencies)) {
      throw new Error(`Type error. Type of ${dependencies} must be an 'Array'`)
    }

    if (
      oldDeps &&
      dependencies.every((dep, i) => utils.isEqual(dep, oldDeps[i]))
    ) {
      return
    }
  }

  const currentComponentUpdate =
    Core.memory.get('effects', id, `updateCount`) ?? []
  const newCurrentComponentUpdate = [...currentComponentUpdate]

  newCurrentComponentUpdate.push(count)
  Core.memory.set('effects', id, `updateCount`, newCurrentComponentUpdate)
}

const callEffects = comp => {
  const { id } = comp.component
  const componentUpdate = Core.memory.get('effects', id, `updateCount`) ?? []

  Core.memory.set('effects', id, `updateCount`, [])

  componentUpdate.forEach(count => {
    const backEffects = Core.memory.get('effects', id, `backEffects`) ?? []
    const oldBackEffect = backEffects[count]

    if (oldBackEffect) {
      oldBackEffect()
    }

    const currentEffect = Core.memory.get('effects', id, 'effects')[count]
    const currentBackEffect = currentEffect()

    if (currentBackEffect && utils.isFunction(currentBackEffect)) {
      const newBackEffects = [...backEffects]

      newBackEffects[count] = currentBackEffect
      Core.memory.set('effects', id, `backEffects`, newBackEffects)
    }
  })
}

const clearEffects = id => {
  const backEffects = Core.memory.get('effects', id, `backEffects`) ?? []

  backEffects.forEach(effect => {
    if (effect) effect()
  })

  Core.memory.clearFields(['effects'], id)
}

export { useEffect, callEffects, clearEffects }
