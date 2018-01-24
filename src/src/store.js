/* eslint no-underscore-dangle:0 */

import { applyMiddleware, createStore, compose } from "redux";
// import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from "./reducers";

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({

    }) : compose;

const enhancer = composeEnhancers(applyMiddleware(promiseMiddleware(), thunk /* createLogger() */));

export default createStore(reducers, enhancer);
