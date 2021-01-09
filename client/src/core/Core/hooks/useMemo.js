import Core from '../index'
import utils from '../../utils'

const useMemo = (func, dependencies) => {
  const id = Core.currentComponentId
  const currentComponentMemos = Core.memory.get('memos', id, 'memos') ?? []
  const count = Core.memory.get('memos', id, `count`)
  const deps = Core.memory.get('memos', id, `deps`) ?? []
  const currentDeps = deps[count]

  Core.memory.set('memos', id, `count`, count + 1)

  if (dependencies) {
    if (!utils.isArray(dependencies)) {
      throw new Error(`Type error. Type of ${dependencies} must be an 'Array'`)
    }

    if (
      currentDeps &&
      dependencies.every((dep, i) => utils.isEqual(dep, currentDeps[i]))
    ) {
      return currentComponentMemos[count]
    }
  }

  const newMemos = [...currentComponentMemos]
  const newDeps = [...deps]
  const newMemo = func()

  newMemos[count] = newMemo
  newDeps[count] = dependencies

  Core.memory.set('memos', id, 'memos', newMemos)
  Core.memory.set('memos', id, `deps`, newDeps)

  return newMemos[count]
}

export default useMemo
