import { authActions } from './auth.actions'
import { cardActions } from './card.actions'
import { requestActions } from './request.actions'
import { searchActions } from './search.actions'
import { validationActions } from './validation.actions'
import { messageActions } from './message.actions'

export const actions = {
  ...authActions,
  ...cardActions,
  ...requestActions,
  ...validationActions,
  ...searchActions,
  ...messageActions,
}
