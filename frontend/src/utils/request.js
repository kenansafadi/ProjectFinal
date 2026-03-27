import { store } from '../store/store';
import { logout } from '../store/reducers/auth';

function getToken() {
   return store.getState().auth.token;
}

function handle401(response) {
   if (response.status === 401) {
      store.dispatch(logout());
   }
   return response;
}

export const post = async (url, data) => {
   const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${getToken()}`,
      },
   });
   return handle401(response);
};

export const put = async (url, data) => {
   const response = await fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${getToken()}`,
      },
   });
   return handle401(response);
};

export const get = async (url, token) => {
   const authToken = token || getToken();
   const response = await fetch(url, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
   });
   return handle401(response);
};

export const postFormData = async (url, formData) => {
   const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
         Authorization: `Bearer ${getToken()}`,
      },
   });
   return handle401(response);
};

export const del = async (url) => {
   const response = await fetch(url, {
      method: 'DELETE',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${getToken()}`,
      },
   });
   return handle401(response);
};
