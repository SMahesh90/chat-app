# ChatSphere
Real-time one-on-one chat application built with Spring Boot, WebSocket (STOMP/SockJS), React, and MySQL.

---

##📌 Overview

ChatSphere is a full-stack messaging application that goes beyond typical CRUD portfolio projects by implementing genuine real-time, bidirectional communication. Authenticated users can add each other as friends and exchange live messages, with instant delivery, typing indicators, online/offline presence, and read receipts — all backed by a persistent message history stored in MySQL. The project was built to demonstrate practical experience with WebSocket-based systems, JWT security applied across both REST and WebSocket layers, and a decoupled React + Spring Boot architecture.

---

## ✨ Features

- **JWT Authentication** — Register/login with hashed passwords (BCrypt) and stateless token-based sessions.
- **Friend System** — Search users by username, send/accept friend requests, and view an accepted friends list.
- **Real-Time Messaging** — Instant one-on-one message delivery over a STOMP-over-WebSocket connection.
- **Persistent Chat History** — All messages stored in MySQL and retrievable via a paginated REST endpoint.
- **Online/Offline Presence** — Live presence updates broadcast on WebSocket connect/disconnect.
- **Typing Indicators** — Real-time "user is typing..." events with automatic timeout-based clearing.
- **Read Receipts** — Messages tracked as `SENT`/`READ`, with checkmark indicators (✓ / ✓✓) in the UI.
- **Automatic Reconnection** — The frontend STOMP client auto-reconnects on connection loss, with a visible "Reconnecting..." banner.
- **Secure WebSocket Handshake** — A custom interceptor validates JWTs before a WebSocket connection is even accepted, not just on REST calls.

## 🛠️ Tech Stack

**Backend:** Java 17, Spring Boot 4.1.0, Spring Web, Spring Data JPA (Hibernate), Spring Security, Spring WebSocket (STOMP), SockJS, JJWT 0.12.6, Lombok, MySQL, Maven

**Frontend:** React (Vite), React Router DOM, Axios, @stomp/stompjs, sockjs-client

**Tools:** Eclipse (Spring Tools 4), VS Code, Postman, Git/GitHub



## 📂 Project Structure
 
```
chat-app/
├── chat-app-backend/
│   ├── src/main/java/com/chatapp/backend/
│   │   ├── config/          # WebSocket + presence event configuration
│   │   ├── controller/      # REST + WebSocket controllers
│   │   ├── dto/              # Request/response objects
│   │   ├── entity/          # JPA entities (User, Friend, Message, UserStatus)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   └── security/        # JWT, handshake auth, Spring Security config
│   ├── src/main/resources/application.properties
│   └── pom.xml
└── chat-app-frontend/
    ├── src/
    │   ├── api/              # Axios config + STOMP WebSocket client
    │   ├── pages/            # Login, Register, Chat, Friends
    │   ├── styles/           # Shared theme tokens
    │   └── App.jsx           # Routing + protected routes
    ├── package.json
    └── vite.config.js
```


