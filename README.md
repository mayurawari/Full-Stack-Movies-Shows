# Full Stack Favourite Movies &amp; TV Show Web App.
# Movie Vault — Full‑Stack Movies/Shows App

## A clean, token‑gated movies app where users can search titles via TMDB, preview details, and manage a personal favorites list with create, edit, and delete. The frontend is React + TypeScript with Material UI, Tailwind, Axios, and Context API. The backend is Express with JWT auth, bcrypt, and route handlers for auth and movies.

### Overview

- Search via TMDB: Type a title, open a dialog with poster and details, then add to favourites.

- Favourites table: View all saved movies in a tabular layout with edit and delete actions.

- Manual entry: Add or edit a movie with a form (title, type, director, year, etc.).

- Auth flow: Signup, login, logout; features are visible only after login.

- Token handling: JWT stored in localStorage; Axios attaches Authorization header; 401s trigger re‑auth redirect.

### Tech Stack

- Frontend: React, TypeScript, Vite, Material UI v7, Tailwind

- State/Auth: Context API, localStorage persistence

- HTTP: Axios with request/response interceptors

- Backend: Node.js, Express, JWT, bcrypt, Sequelize models for User/Movie and blacklist

## Key Features

### Protected UI:

- Home is wrapped in a Protected route; users without a token are redirected to /auth.

### Test Login Credentials

- email* : example@gmail.com
- password* : 123456

### Rehydrated auth:

- On app load, token and lightweight user are restored from localStorage so the header shows username + Logout without flicker.

- Axios interceptors:

- Outgoing requests include Authorization: Bearer <token>.

- 401 responses clear token and route to /auth.

- TMDB search dialog:

- Uses the backend proxy endpoint; shows poster, director, year, etc.; Add posts to favourites.

- Favourites management:

- Table with sticky header and actions; edit opens a dialog with the same form; delete has confirmation.

- Manual form:

- Create and update entries with consistent fields; supports type: Movie/Series.

- Security and Access

- Server should mount movie routes behind JWT middleware to enforce auth on add/list/update/delete and optionally on TMDB search. If search should be public, only protect CRUD routes.

- Logout blacklists token server‑side; client clears storage and stops sending the header.

### Prerequisites

- Node.js 18+

- npm or pnpm or yarn

- TMDB API key

### Environment Variables

- Backend (.env)

- KEY=your_jwt_secret

- TMDB_KEY=your_tmdb_api_key

- DATABASE_URL or per‑dialect configs

- Frontend (.env)

- VITE_API_URL=http://localhost:3000

- Install and Run

### Backend

- Navigate to Backend

- npm install
  
- settle .env

- npm run server / npm run start

### Frontend

- Navigate to Frontend

- npm install

- npm run dev

### Usage Flow

- Sign up or log in from /auth. On success, a JWT is stored and the app navigates to Home.

- Use the search bar to find a movie via TMDB; review details in the dialog; click Add to favourites.

- Manage favourites from the table: edit to update fields or delete to remove entries.

- Use the manual form to add movies not found on TMDB.

- Click Logout in the header to end the session; the token is blacklisted server‑side and cleared client‑side.

# Deployed Link 
- 🔗 **Live:** [Click here to try](https://full-stack-movies-shows.vercel.app/auth)  
