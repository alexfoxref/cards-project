import Core from "../Core"
import useCallback from "./useCallback"
import useState from './useState'


const useReducer = (reducer, initialState) => {
    const id = Core.currentComponentId
    const [state, setState] = useState(initialState)
    const count = Core.memory.get('states', id, 'count') - 1

    const dispatch = useCallback(action => {
        const prevState = Core.memory.get('states', id, 'states')[count][0]
        const newState = reducer(prevState, action)
        
        setState(newState)
    }, [state])

    return [state, dispatch]
}

export default useReducer