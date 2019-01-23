import { applyMiddleware, compose, createStore } from 'redux';
import { cacheEnhancer } from 'redux-cache';
import { createEpicMiddleware } from 'redux-observable';
import reduxThunk from 'redux-thunk';

import rootReducer from './modules';
import services from './modules/services';
import rootEpic from './rootEpic';

const middlewares: any = [];
const epicMiddleware = createEpicMiddleware({
  dependencies: services,
});
middlewares.push(reduxThunk.withExtraArgument(services));
middlewares.push(epicMiddleware);

let middleware = applyMiddleware(...middlewares);

if (process.env.NODE_ENV !== 'production' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
  middleware = compose(
    middleware,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
    cacheEnhancer()
  );
}
const store = createStore(rootReducer, middleware);
epicMiddleware.run(rootEpic);
export { store };
