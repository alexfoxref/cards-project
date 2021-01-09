import Store from "./Store"

export const createStore = ({initialState, reducer, actions}) => {
    return new Store({initialState, reducer, actions})
}