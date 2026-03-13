# Curtain Call — Broadway Musical Writing App

A full-stack app for writing your own Broadway-style musical: story, characters, song plan, script, and an AI writing assistant. Design is dramatic and Broadway-inspired (dark backgrounds, gold accents).

---

## What’s in the project

- **Backend** (`/backend`): Node.js + Express API, SQLite database, JWT login
- **Frontend** (`/frontend`): React + Vite app with:
  - **Story Builder** — Title, premise, and plot
  - **Character Creator** — Add and edit characters
  - **Song Planner** — Plan songs by act/scene with notes
  - **Script** — Write your book (dialogue and stage directions), auto-saves
  - **AI Assistant** — Get suggestions when you’re stuck (optional: needs OpenAI API key)

---

## Step-by-step: run the app

### 1. Install Node.js

If you don’t have Node.js:

- Go to [nodejs.org](https://nodejs.org) and download the **LTS** version.
- Install it, then open a **new** terminal and run:  
  `node -v`  
  You should see a version number (e.g. `v20.x.x`).

### 2. Install dependencies (one-time)

In a terminal, from the `phil_app` folder:

```bash
cd /Users/nathanielrobertson/Documents/GitHub/phil_app
npm install        # installs \"concurrently\" at the root
cd backend && npm install
cd ../frontend && npm install
```

You only need to do these installs the first time (or after deleting `node_modules`).

### 3. Start everything with one command

From the `phil_app` folder:

```bash
cd /Users/nathanielrobertson/Documents/GitHub/phil_app
npm run dev
```

This runs:

- the **backend** on `http://localhost:3001`
- the **frontend** on `http://localhost:3000`

Leave this terminal open while you use the app.

### 4. (Alternative) Start backend and frontend separately

If you prefer two terminals, you can still do it this way:

#### Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Then create a `.env` file (copy from the example):

```bash
cp .env.example .env
```

Edit `.env` and set:

- `JWT_SECRET` — any long random string (e.g. `my-super-secret-key-123`).
- (Optional) `OPENAI_API_KEY` — your OpenAI API key if you want the AI assistant to call OpenAI.

Start the server:

```bash
npm run dev
```

You should see: **Broadway App API running at http://localhost:3001**

Leave this terminal open.

#### Frontend

Open a **second** terminal and run:

```bash
cd frontend
npm install
npm run dev
```

You should see something like: **Local: http://localhost:3000**

### 5. Use the app

1. In the browser go to: **http://localhost:3000**
2. Click **“Create an account”** and register with an email and password.
3. After sign-in you’ll land on **Story**. Enter a title, premise, and plot.
4. Use the sidebar to open **Characters**, **Songs**, **Script**, and **AI Assistant**.

---

## Quick reference

| What              | Where / How                                      |
|-------------------|---------------------------------------------------|
| Backend API       | `http://localhost:3001` (must be running first)  |
| Frontend          | `http://localhost:3000`                          |
| Database          | SQLite file: `backend/broadway.db` (created on first run) |
| Logout            | Sidebar → “Sign out”                              |

---

## Optional: AI suggestions

To use the AI writing assistant with real suggestions:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys).
2. In `backend/.env` add:  
   `OPENAI_API_KEY=sk-your-key-here`
3. Restart the backend (`Ctrl+C` then `npm run dev` in `backend`).

Without an API key, the assistant still works and will show a short tip instead of calling OpenAI.

---

## Tech stack (for reference)

- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT (jsonwebtoken), bcrypt
- **Frontend:** React 18, React Router, Vite
- **Styling:** CSS with Broadway theme (Cinzel + Source Serif 4, dark + gold)

Enjoy writing your musical.
