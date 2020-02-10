// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import gallery from './galleryReducer';
import viewer from './viewerReducer';
import backend from './backendReducer';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    gallery,
    viewer,
    backend
  });
}
