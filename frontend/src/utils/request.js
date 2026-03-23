import { store } from '../store/store';

export const post = async (url, data) => {
   return await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${store.getState().auth.token}`,
      },
   });
};

export const put = async (url, data) => {
   return await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${store.getState().auth.token}`,
      },
   });
};


// utils/request.js
export const get = (url, token) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }), // <-- token here
    },
    credentials: 'include', 
  });
};

