import { createStore } from '../core/Store/createStore'
import { initialState } from './constants'
import { reducer } from './reducers'
import { actions } from './actions'

export const store = createStore({ initialState, reducer, actions })
