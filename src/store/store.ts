import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistenceMiddleware } from './persistence';
import authReducer from './slices/auth.slice';
import cartReducer from './slices/cart.slice';
import ordersReducer from './slices/orders.slice';
import uiReducer from './slices/ui.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  orders: ordersReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** A new store per request on the server, one store in the browser (see StoreProvider). */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().prepend(persistenceMiddleware.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
