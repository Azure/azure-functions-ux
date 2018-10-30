import { applyMiddleware, compose, createStore } from 'redux';
import reduxThunk from 'redux-thunk';
import { reducers } from './modules';
import { cacheEnhancer } from 'redux-cache';

const middlewares: any = [];

middlewares.push(reduxThunk);

let middleware = applyMiddleware(...middlewares);

if (process.env.NODE_ENV !== 'production' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
  middleware = compose(
    middleware,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
    cacheEnhancer()
  );
}
const store = createStore(reducers, middleware);

export { store };
