import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   user: null,
   token: null,
   isAuthenticated: false,
   isPrivate: false,
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      login: (state, action) => {
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.isPrivate = action.payload.isPrivate;
      },

      logout: (state) => {
         state.user = null;
         state.token = null;
         state.isAuthenticated = false;
         state.isPrivate = false;
      },

      setUserFromToken: (state, action) => {
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
      },
   },
});

export const { login, logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;