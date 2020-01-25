import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory, createMemoryHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import createRootReducer from '../reducers';
import * as counterActions from '../actions/counter';
import * as galleryActions from '../actions/galleryActions';
import type { counterStateType } from '../reducers/types';
import {
  forwardToMain,
  forwardToRenderer,
  triggerAlias,
  replayActionMain,
  replayActionRenderer,
} from 'electron-redux';

let history;

const configureStore = (initialState?: counterStateType, scope) => {
  const rootReducer = createRootReducer(history);

  // Redux Configuration
  let middleware = [thunk];
  const enhancers = [];

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  if (scope == 'main') middleware = [triggerAlias, ...middleware, forwardToRenderer];
  else middleware = [forwardToMain, router, ...middleware];

  // Redux DevTools Configuration
  const actionCreators = {
    ...counterActions,
    ...galleryActions,
    ...routerActions
  };

  // console.log(scope);
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = scope == 'renderer' ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Options: http://extension.remotedev.io/docs/API/Arguments.html
        actionCreators
      })
    : compose)
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('../reducers').default)
    );
  }

  if (scope == 'main') replayActionMain(store);
  else replayActionRenderer(store);

  return store;
};

export default process => { 
  history = process == 'main' ? createMemoryHistory() : createHashHistory(); 
  return {configureStore, history}
};
