# CHALK – Collaborative Code Execution Platform

## Overview

CHALK is a full-stack code execution platform that allows users to write code, execute it securely inside isolated Docker containers, and view results in real time through a modern web interface.

The project is designed with scalability and collaboration in mind. The current version focuses on secure code execution and asynchronous job processing, while future phases introduce authentication, code persistence, and real-time collaborative editing.

---

## Features

### Current Features

* Multi-language code execution

  * JavaScript
  * Python
  * Java
  * C++

* Secure Docker-based sandboxing

  * Isolated execution environments
  * No external network access
  * Resource limits on CPU and memory

* Asynchronous execution pipeline

  * Job queue using BullMQ
  * Redis-backed task processing
  * Dedicated worker service

* Modern code editor

  * Monaco Editor integration
  * Syntax highlighting
  * Language selection

* Real-time execution status updates

  * Queued
  * Running
  * Completed
  * Failed

* REST API architecture

* Production deployment

  * Azure Virtual Machine
  * Nginx reverse proxy
  * PM2 process management
  * Docker execution environment

---

## Architecture

```text
Client
   │
   ▼
Frontend (React + TypeScript)
   │
   ▼
Express API Server
   │
   ▼
BullMQ Queue
   │
   ▼
Redis
   │
   ▼
Worker Service
   │
   ▼
Docker Sandbox
   │
   ▼
Execution Result
```

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Monaco Editor

### Backend

* Node.js
* Express
* TypeScript

### Queue & Processing

* BullMQ
* Redis

### Database

* PostgreSQL
* Drizzle ORM

### Infrastructure

* Docker
* PM2
* Nginx
* Azure Virtual Machine

---

## Security Measures

Code execution platforms present unique security challenges. CHALK mitigates these risks through container isolation and resource restrictions.

Current safeguards include:

* Dedicated Docker container per execution
* Disabled networking
* Read-only container filesystem
* Restricted container capabilities
* CPU limits
* Memory limits
* Temporary execution environment cleanup

Example Docker execution configuration:

```bash
docker run \
  --rm \
  --network none \
  --memory=128m \
  --cpus=0.5 \
  --read-only \
  --tmpfs /tmp:exec \
  --cap-drop ALL
```

---

## Project Structure

```text
chalk/
│
├── frontend/
│   ├── src/
│     ├── components/
│     ├── assets/
│     ├── types/
│     └── context/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── workers/
│   ├── queue/
│   ├── docker/
│   └── database/
│
└── infrastructure/
```

---

## Execution Flow

1. User writes code in the editor.
2. Frontend sends execution request to the API.
3. API validates the request.
4. Job is added to the BullMQ queue.
5. Worker picks up the job.
6. Worker creates an isolated Docker container.
7. Code is compiled/executed.
8. Output is captured.
9. Results are stored.
10. Frontend receives execution status and output.

---

## Local Development

### Prerequisites

* Node.js
* Docker
* Redis
* PostgreSQL

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Worker

```bash
npm run worker
```

---

## Environment Variables

### Backend

```env
PORT=3000

DATABASE_URL=

REDIS_URL=

EXECUTION_TIMEOUT_MS=5000
```

### Frontend

```env
VITE_API_URL=http://localhost:3000
```

---

## API Endpoints

### Create Execution Job

```http
POST /api/execute
```

Request:

```json
{
  "language": "javascript",
  "code": "console.log('Hello World')"
}
```

### Get Job Status

```http
GET /api/jobs/:id
```

Response:

```json
{
  "id": "job-id",
  "status": "completed",
  "output": "Hello World"
}
```

---

# Roadmap

## Phase 1 — Secure Code Execution Platform ✅

### Goals

* Multi-language execution
* Docker sandboxing
* Queue-based processing
* Job status tracking
* Azure deployment
* Production infrastructure

### Status

Completed

---

## Phase 2 — Authentication & Code Persistence

### Planned Features

#### User Authentication

* Account creation
* Login
* Logout
* Protected routes
* Session management

#### Saved Projects

Users will be able to:

* Save code files
* Organize projects
* Create multiple files
* Reopen previous work
* Maintain execution history

#### User Dashboard

* Recent projects
* Execution history
* Saved snippets
* Profile settings

### Suggested Technologies

* JWT Authentication
* Refresh Tokens
* PostgreSQL
* Drizzle ORM

---

## Phase 3 — Real-Time Collaboration

### Planned Features

#### Collaborative Editing

Multiple users can:

* Join shared rooms
* Edit code simultaneously
* See live cursor positions
* View remote selections

#### Shared Execution

* Execute collaboratively edited code
* Shared execution results
* Team workspaces

#### Presence Indicators

* Active participants
* Typing indicators
* Connection status

### Suggested Technologies

* Socket.IO
* WebSockets
* Yjs CRDT
* Monaco Collaboration Layer

---

## Future Enhancements

### Advanced Execution

* Custom stdin support
* Test case execution
* Competitive programming mode
* Multiple file execution

### AI Features

* Code explanation
* Bug detection
* Code optimization suggestions
* AI pair programmer

### Platform Features

* Public project sharing
* Fork projects
* Templates
* Team workspaces
* Project versioning

---

## Deployment

### Frontend

* Vercel

### Backend

* Azure Virtual Machine
* Nginx Reverse Proxy
* PM2 Process Manager

### Execution Environment

* Docker Containers
