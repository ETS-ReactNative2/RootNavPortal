import { createStore, applyMiddleware, compose } from 'redux';
import { ipcRenderer } from 'electron';
import thunk from 'redux-thunk';
import { createHashHistory, createMemoryHistory } from 'history';
import { routerMiddleware, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import createRootReducer from '../reducers';
import * as galleryActions from '../actions/galleryActions';
import { electronEnhancer } from 'redux-electron-store';

let history;
//Some notes about the Redux changes:
//configureStore now takes a 'scope' arg, either 'main' or 'renderer', to reflect which Redux store is being configured
//There is a store in each process now, which have an IPC layer to sync up. Oddly, it seems like they only init with the last action's data
//
const configureStore = (initialState, scope) => {
  const rootReducer = createRootReducer(history);

  // Redux Configuration
  let middleware = [thunk];

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  // Skip redux logs in console during the tests
  if (process.env.NODE_ENV !== 'test' && scope != 'main') {
    middleware.push(logger);
  }

  // Router Middleware
  middleware.push(routerMiddleware(history));

  // Redux DevTools Configuration
  const actionCreators = {
    ...galleryActions,
    ...routerActions
  };

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
  // enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(applyMiddleware(...middleware), electronEnhancer({dispatchProxy: a => store.dispatch(a)}));

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      if (scope === 'renderer') ipcRenderer.sendSync('renderer-reload'); //Hot reload reducers in main process
      store.replaceReducer(require('../reducers').default)
    });
  }

  return store;
};

//Importing module sets history and returns it in the export. Required due to history being used in the configureStore func.
//Caveat to this is that store COULD be misconfigured using the wrong type of history if for some reason, the two things try to do it at the same time
//However this should be impossible as it is imported and immediately called in every instance, returning a store configured with that history type. 
//May be a source of odd behaviour down the line. Keep eyes peeled.
export default process => { 
  history = process == 'main' ? createMemoryHistory() : createHashHistory(); 
  return {configureStore, history}
};
