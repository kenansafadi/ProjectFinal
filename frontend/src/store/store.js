import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './reducers/auth';
// 1️⃣ Combine reducers first
const rootReducer = combineReducers({
  auth: authReducer,
});

// 2️⃣ Persist configuration
const persistConfig = {
  key: 'root',
  storage,
};

// 3️⃣ Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// 5️⃣ Persistor
const persistor = persistStore(store);

export { store, persistor };