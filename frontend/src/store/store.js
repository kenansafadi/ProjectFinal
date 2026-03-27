import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './reducers/auth';
// 1️⃣ ליצור rootReducer עם כל הרדוסרים שלך
const rootReducer = combineReducers({
  auth: authReducer,
});

// 2️קונפיגורציה ל-persist
const persistConfig = {
  key: 'root',
  storage,
};

// 3️⃣ ליצור persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ ליצור את החנות עם persistedReducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// 5️⃣ Persistor
const persistor = persistStore(store);

export { store, persistor };