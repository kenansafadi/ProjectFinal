import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   isLoggedIn: false,
   user: null,
   token: null,
   isAuthenticated: false,
   isPrivate: false,
};

export const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      login: (state, action) => {
         state.isLoggedIn = true;
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
         state.isPrivate = action.payload.isPrivate;
      },
      logout: (state) => {
         state.isLoggedIn = false;
         state.user = null;
         state.token = null;
         state.isAuthenticated = false;
      },
      updateUser: (state, action) => {
         if (action.payload.username) {
            state.user.username = action.payload.username;
         }
         if (action.payload.email) {
            state.user.email = action.payload.email;
         }
         if (action.payload.isPrivate) {
            state.user.isPrivate = action.payload.isPrivate;
         }
      },
   },
});

export const { login, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
