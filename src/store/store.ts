import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistenceMiddleware } from './persistence';
import addressesReducer from './slices/addresses.slice';
import authReducer from './slices/auth.slice';
import cartReducer from './slices/cart.slice';
import locationReducer from './slices/location.slice';
import ordersReducer from './slices/orders.slice';
import reviewsReducer from './slices/reviews.slice';
import uiReducer from './slices/ui.slice';
import wishlistReducer from './slices/wishlist.slice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  orders: ordersReducer,
  ui: uiReducer,
  wishlist: wishlistReducer,
  addresses: addressesReducer,
  reviews: reviewsReducer,
  location: locationReducer,
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
