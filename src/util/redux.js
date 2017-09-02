import { createStore } from 'redux';
import { createAction, handleActions } from 'redux-actions';
import R from 'ramda';

const SELECT_IMAGE = 'SELECT_IMAGE';
const DISMISS_MODAL = 'DISMISS_MODAL';

export const selectImage = createAction(SELECT_IMAGE);
export const dismissModal = createAction(DISMISS_MODAL);

const initialState = {
  selectedImage: null,
};

export const selectedImage = R.path(['selectedImage']);

const reducer = handleActions(
  {
    [selectImage]: (state, { payload }) => ({
      ...state,
      selectedImage: payload,
    }),
    [dismissModal]: (state, action) => ({
      ...state,
      selectedImage: null,
    }),
  },
  initialState
);

let devtools = f => f;
if (process.browser && window.__REDUX_DEVTOOLS_EXTENSION__) {
  devtools = window.__REDUX_DEVTOOLS_EXTENSION__();
}

export default createStore(reducer, initialState, devtools);
