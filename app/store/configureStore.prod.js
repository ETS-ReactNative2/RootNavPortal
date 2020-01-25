// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory, createMemoryHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';
import type { counterStateType } from '../reducers/types';
import {
    forwardToMain,
    forwardToRenderer,
    triggerAlias,
    replayActionMain,
    replayActionRenderer,
} from 'electron-redux';

let history;

function configureStore(initialState?: counterStateType, scope) {
    const history = scope == 'main' ? createMemoryHistory() : createHashHistory();
    const rootReducer = createRootReducer(history);
    const router = routerMiddleware(history);
    let middleware = [thunk];

    if (scope == 'main') middleware = [triggerAlias, ...middleware, forwardToRenderer];
    else middleware = [forwardToMain, router, ...middleware]

    const enhancer = applyMiddleware(...middleware);
    const store = createStore(rootReducer, initialState, enhancer);

    if (scope == 'main') replayActionMain(store);
    else replayActionRenderer(store);
    return store;
}

export default process => { 
    history = process == 'main' ? createMemoryHistory() : createHashHistory(); 
    return {configureStore, history}
};