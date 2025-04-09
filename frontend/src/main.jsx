import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./Styles/index.scss";

// Import all context providers
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext.jsx";
import { FollowProvider } from "./components/context/FollowContext.jsx";
import { PostProvider } from "./components/context/PostContext.jsx";
import { ChatProvider } from "./components/context/ChatContext.jsx";
import { NotificationProvider } from "./components/context/NotificationContext.jsx";
import { ProfileProvider } from "./components/context/ProfileContext.jsx";
// Wrap your providers around the App component
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>

      <ProfileProvider>  {/* ProfileProvider should wrap AuthProvider */}
        <AuthProvider>
          <FollowProvider>
            <PostProvider>
              <NotificationProvider>
                <ChatProvider>
                  <App />
                </ChatProvider>
              </NotificationProvider>
            </PostProvider>
          </FollowProvider>
        </AuthProvider>
      </ProfileProvider>
    </BrowserRouter>

  </StrictMode>
);
