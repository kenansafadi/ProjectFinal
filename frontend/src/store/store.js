import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/auth';
import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const persistConfig = {
   key: 'root',
   storage,
};

const persistedReducer = persistReducer(
   persistConfig,
   combineReducers({
      auth: authReducer,
   })
);

const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

export { store, persistor };
