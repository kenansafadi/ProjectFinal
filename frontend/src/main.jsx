import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import './Styles/main.css';
import './Styles/index.scss';

import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from './store/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ProfileProvider } from './components/context/ProfileContext.jsx';
import { NotificationProvider } from './components/context/NotificationContext.jsx';
import { ChatProvider } from './components/context/ChatContext.jsx';
import { PostProvider } from './components/context/PostContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
         <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
               <BrowserRouter>
                  <ProfileProvider>
                     <PostProvider>
                        <ChatProvider>
                           <NotificationProvider>
                              <App />
                           </NotificationProvider>
                        </ChatProvider>
                     </PostProvider>
                  </ProfileProvider>
               </BrowserRouter>
            </PersistGate>
         </Provider>
      </GoogleOAuthProvider>
   </StrictMode>
);
