# ChatGPT Frontend - React & Tailwind CSS

A modern, production-grade frontend interface built with **React 19**, **Tailwind CSS v4**, and **Socket.io Client**, specifically integrated with the Express & Google Gemini + Pinecone backend.

---

## 🚀 Features

- **Authentication System**:
  - Sign in & registration modal with real-time form validation
  - Persistent sessions using JWT tokens stored securely in state and `localStorage`
  - Cookie credentials synchronization (`withCredentials: true`)
  - Direct Guest Demo mode for exploring the UI without an active database

- **Real-Time Streaming Engine**:
  - Bidirectional WebSocket communication via **Socket.io**
  - Sends `chat-message` payloads: `{ chat: "<chatId>", content: "<text>" }`
  - Listens to `message-response` events: `{ content: "<aiResponse>", chatId: "<chatId>" }`
  - Visual connection indicator (Connected, Reconnecting, Disconnected)

- **AI Model & Memory Integration**:
  - Highlights Google Gemini 2.5 Flash reasoning
  - Displays Pinecone Vector Memory (768-dimensional embeddings) retrieval status
  - Dynamic thinking and generating states with animated loading pulses

- **ChatGPT Workspace UI**:
  - **Collapsible Sidebar**:
    - "+ New Chat" session creation
    - Instant conversation search filter
    - Chronologically grouped sessions (*Today*, *Previous 7 Days*, *Older*)
    - Active chat highlight and delete confirmation modal
    - User profile card with initials avatar and logout trigger
  - **Header**:
    - Current chat title, model badges, live WebSocket indicator, quick action buttons
  - **Empty State**:
    - Welcome hero with 4 interactive starter prompts (Coding, Vector Memory, System Architecture, Algorithms)
  - **Message Stream**:
    - Distinct user and AI bubbles
    - Syntax-highlighted code blocks with "Copy code" button
    - Message copy, thumbs-up / thumbs-down reactions, timestamps
    - Auto-scrolling and floating "Scroll to bottom" button
  - **Input Bar**:
    - Multi-line auto-expanding textarea (Enter to send, Shift+Enter for newline)
    - Dynamic gradient send button and thinking state

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Networking**: [Axios](https://axios-http.com/) & [Socket.io-client](https://socket.io/)
- **Typography**: Inter & JetBrains Mono (via Google Fonts)

---

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── api.js              # Axios HTTP client, interceptors, and backend endpoints
│   ├── context/
│   │   ├── AuthContext.jsx      # Global authentication state, login, register, guest mode
│   │   └── SocketContext.jsx    # Socket.IO connection manager, reconnection, event listeners
│   ├── hooks/
│   │   └── useChat.js           # Chat session management, message feeds, and persistence
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthPage.jsx     # Glassmorphism authentication landing page
│   │   ├── sidebar/
│   │   │   ├── Sidebar.jsx      # Chat history drawer, search, and user profile
│   │   │   └── ChatItem.jsx     # Individual chat row with delete action
│   │   └── chat/
│   │       ├── ChatArea.jsx     # Main chat workspace & scroll manager
│   │       ├── ChatHeader.jsx   # Top status bar with model info and socket status
│   │       ├── ChatInput.jsx    # Expanding prompt input box and controls
│   │       ├── ChatMessage.jsx  # Formatted user and AI messages with code copy
│   │       └── EmptyState.jsx   # ChatGPT greeting with prompt suggestion cards
│   ├── App.jsx                  # Main application orchestrator
│   ├── main.jsx                 # React root renderer
│   └── index.css                # Tailwind CSS v4 directives and theme variables
├── index.html                   # HTML entry point with fonts & metadata
├── vite.config.js               # Vite config with Tailwind plugin and dev proxy
└── package.json
```

---

## 🏃 Running Locally

### 1. Start the Backend
From the root directory:
```bash
cd backend
npm install
# Ensure .env is populated with MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, PINECONE_API_KEY
npm run dev
```

### 2. Start the Frontend
From the root directory:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** (or the port indicated in the terminal) in your browser.

---

## 🔗 Backend Contract Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/register` | Creates account with `{ fullName: { firstName, lastName }, email, password }` |
| `POST` | `/api/v1/login` | Authenticates with `{ email, password }` |
| `POST` | `/api/v1/chat` | Creates a new chat with `{ title }` |
| `GET` | `/api/v1/chat` | Retrieves user's chats |
| `GET` | `/api/v1/chat/:id/messages` | Retrieves messages for a chat |
| `DELETE` | `/api/v1/chat/:id` | Deletes a chat and its messages |
| `WS` | `/socket.io` | Real-time chat streaming (`chat-message` -> `message-response`) |
