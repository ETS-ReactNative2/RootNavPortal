// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import gallery from './galleryReducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    gallery,
    counter
  });
}
