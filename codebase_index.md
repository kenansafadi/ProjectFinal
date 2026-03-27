# ProjectFinal — Codebase Index

Full-stack social app: React+Vite frontend, Node/Express+MongoDB backend, real-time via Socket.IO.

---

## Backend (`backend/`)

### Entry Point
- [app.js](file:///Users/dami/stuff/ProjectFinal/backend/app.js) — Express server + Socket.IO setup, CORS, route mounting. Port 3005.

### Models (`model/`)
| File | Collection | Key Fields | Notes |
|------|-----------|------------|-------|
| [usersModel.js](file:///Users/dami/stuff/ProjectFinal/backend/model/usersModel.js) | [User](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/context/ProfileContext.jsx#48-59) | username, email, password, isVerified, followers[], following[], profilePicture | followers/following are **embedded arrays** with `{name, userId: String, isAccepted}`. 40 lines of **commented-out legacy schema** at top. Exports Joi validators. |
| [postModel.js](file:///Users/dami/stuff/ProjectFinal/backend/model/postModel.js) | [Post](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/Post.jsx#10-187) | userId (String), title, content, image, likes[], comments[] with nested replies[] | `userId` is a **plain String**, not ObjectId ref. Comments/replies embedded with `author_name`. |
| [MessageModel.js](file:///Users/dami/stuff/ProjectFinal/backend/model/MessageModel.js) | `Message` | senderId, receiverId (ObjectId refs), text, isRead, sender_name | Uses **ObjectId refs** — inconsistent with other models using String IDs. |
| [Notification.js](file:///Users/dami/stuff/ProjectFinal/backend/model/Notification.js) | `Notification` | userId (String), text, message, read, sender_name, senderId (String), type | String-based IDs. |
| [authModel.js](file:///Users/dami/stuff/ProjectFinal/backend/model/authModel.js) | [Auth](file:///Users/dami/stuff/ProjectFinal/frontend/src/hooks/useReduxAuth.js#6-23) | email, password | **Legacy model** — appears unused (auth uses User model). Hebrew comments. |

### Routes (`routes/`)
| File | Prefix | Auth? | Notes |
|------|--------|-------|-------|
| [auth.js](file:///Users/dami/stuff/ProjectFinal/backend/routes/auth.js) | `/api/auth` | No | register, verify, login, Google OAuth, forgot/reset password. Inline handlers for forgot/reset. |
| [postRoute.js](file:///Users/dami/stuff/ProjectFinal/backend/routes/postRoute.js) | `/api/posts` | Mixed | `GET /` is **public** (no auth). Create/like/comment/reply require auth. Has **inline handlers** alongside controller imports. Share endpoint references non-existent `shares` field. |
| [userRoute.js](file:///Users/dami/stuff/ProjectFinal/backend/routes/userRoute.js) | `/api/users` | Yes (via app.js mount) | All inline handlers. follow/unfollow/accept/reject friend requests. `PUT /update` sets `user.name` but schema has `username` — **field mismatch**. |
| [chatRoute.js](file:///Users/dami/stuff/ProjectFinal/backend/routes/chatRoute.js) | `/api/chat` | Yes | first-chat-user, users list, messages. Commented-out old code. |
| [notificationRoutes.js](file:///Users/dami/stuff/ProjectFinal/backend/routes/notificationRoutes.js) | `/api/notifications` | **No** ⚠️ | Mounted without auth middleware in [app.js](file:///Users/dami/stuff/ProjectFinal/backend/app.js). Gets by userId query param. |

### Controllers (`controllers/`)
5 files: auth, chat, notification, post, user. Some are used, some bypassed by inline route handlers.

### Middleware ([middleware/](file:///Users/dami/stuff/ProjectFinal/frontend/src/store/store.js#22-24))
- [auth.js](file:///Users/dami/stuff/ProjectFinal/backend/middleware/auth.js) — JWT verification, sets `req.user = decoded`
- [follow.js](file:///Users/dami/stuff/ProjectFinal/backend/middleware/follow.js) — Basic follow validation (unused in routes)

### Utils & Services
- [utils/index.js](file:///Users/dami/stuff/ProjectFinal/backend/utils/index.js) — bcrypt hash/verify, JWT sign/verify
- [utils/emailService.js](file:///Users/dami/stuff/ProjectFinal/backend/utils/emailService.js) — Email sending + templates
- `services/` — PostService, chatService, googleService (thin wrappers)
- `config/` — JWT config, Passport Google strategy

---

## Frontend (`frontend/src/`)

### Entry Points
- [main.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/main.jsx) — Provider tree: Redux → PersistGate → BrowserRouter → ProfileProvider → PostProvider → ChatProvider → NotificationProvider → App
- [App.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/App.jsx) — Route definitions with `ProtectedRoute`/`GuestRoute` wrappers

### Pages (`pages/`)
| Page | Route | Notes |
|------|-------|-------|
| Home.jsx | `/` | Protected |
| Profile.jsx | `/profile` | Protected, receives `user` prop |
| PublicProfile.jsx | `/public-profile/:id` | **Public** |
| Messages.jsx | `/messages` | Protected |
| Notifications.jsx | `/notifications` | Protected |
| Settings.jsx | `/settings` | Protected |
| MyPost.jsx | `/my-posts` | Protected |
| About.jsx | - | Not routed? |
| Explore.jsx | - | Not routed? |
| verify.jsx | `/verify-account` | Public |
| forgotPassword.jsx | `/forgot-password` | Public |
| resetPassword.jsx | `/reset-password` | Public |

### Components (`components/`)

**Top-level:**
- [Post.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/Post.jsx) — **Main post card** (390 lines). Handles author display, likes, comments, replies. Contains `Comment` and `AddCommentModal` inline.
- [Navbar.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/Navbar.jsx), [Sidebar.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/Sidebar.jsx), [Layout.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/Layout.jsx)
- [PostModal.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/PostModal.jsx), [DeletePost.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/DeletePost.jsx), [NavSearch.jsx](file:///Users/dami/stuff/ProjectFinal/frontend/src/components/NavSearch.jsx)

**Subdirectories:**
- `Auth/` — login, register, logout, welcome (4 files)
- `Chat/` — ChatBox, ChatInfo, MessageInput (3 files)
- `Feed/` — **Duplicate post components**: Post.jsx, PostList.jsx, Comment.jsx, LikeButton.jsx, ShareButton.jsx ⚠️
- `Profile/` — FollowButton, ProfileCard, ProfileEditForm
- `common/` — NavBar, NotificationBell, SearchBar, SideBar, footer
- `hooks/` — useChat, useFollow, useNotifications, usePost, useProfile (context consumers)
- `context/` — 6 context providers (Auth, Chat, Follow, Notification, Post, Profile)

### State Management
- **Redux** (auth only): [store/reducers/auth.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/store/reducers/auth.js) — login/logout/setUserFromToken. Persisted via redux-persist.
- **React Context** (everything else): Post, Profile, Chat, Notification, Follow contexts

### API Layer
- [utils/request.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/utils/request.js) — `get`/`post`/`put` helpers that auto-attach Bearer token from Redux store. `get` has commented-out old implementation. Console.logs token on every GET.
- [utils/api.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/utils/api.js), [utils/socket.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/utils/socket.js), [utils/jwtHelper.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/utils/jwtHelper.js)
- `services/` — 5 service files (auth, post, profile, chat, notification) wrapping API calls

### Hooks
- [useReduxAuth.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/hooks/useReduxAuth.js) — Token refresh/decode + auth state
- [useSocket.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/hooks/useSocket.js), [useClickOutside.js](file:///Users/dami/stuff/ProjectFinal/frontend/src/hooks/useClickOutside.js)

### Styles
- **Hybrid Tailwind + SCSS** — Tailwind utilities in JSX, SCSS globals imported
- [Global.scss](file:///Users/dami/stuff/ProjectFinal/frontend/src/Styles/Global.scss) — **⚠️ Global `button` selector** (lines 99-117) applies blue #007bff background to ALL buttons. Root cause of UI regressions.
- 8 more SCSS files for specific features (NavBar, login, register, profile, etc.)

---

## Known Issues & Tech Debt Summary

| Issue | Impact | Priority for Deadline |
|-------|--------|----------------------|
| Global `button` CSS in Global.scss | Causes blue-box regressions on any `<button>` | Fix if touching UI |
| Notification routes have **no auth** | Security gap | Fix if in scope |
| `name` vs `username` field mismatch | `PUT /users/update` sets `user.name` but schema only has `username` | Fix if touching profiles |
| Duplicate post components (`components/Post.jsx` vs `components/Feed/Post.jsx`) | Confusion, maintenance burden | Don't touch unless consolidating |
| Inconsistent ID types (String vs ObjectId) across models | Works but fragile | Don't touch |
| `authModel.js` appears unused (legacy) | Dead code | Ignore |
| `shares` endpoint references non-existent field | Will crash if called | Fix only if share feature is in scope |
| Console.log in `request.js` `get()` | Leaks token to console | Quick fix when convenient |
| Commented-out code everywhere | Noise | Clean up as you touch files |

---

## No existing tests found anywhere in the codebase.
