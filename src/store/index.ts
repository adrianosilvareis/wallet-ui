import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import configurationReducer from './slices/configurationSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    configuration: configurationReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
