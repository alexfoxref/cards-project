import { combineReducers } from '../../core/Store/combineReducers'
import { authReducer } from './auth.reducer'
import { cardReducer } from './card.reducer'
import { requestReducer } from './request.reducer'
import { searchReducer } from './search.reducer'
import { validationReducer } from './validation.reducer'

export const reducer = combineReducers({
  auth: authReducer,
  card: cardReducer,
  request: requestReducer,
  validation: validationReducer,
  search: searchReducer,
})
