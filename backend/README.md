# Gemini README Generator

The project has a static HTML/CSS/JavaScript frontend in `frontend/` and an
Express API in `backend/`. The API generates Markdown with Gemini and stores
README history in MongoDB.

## Run locally

From the repository root, install the backend dependencies and start the API:

```sh
cd backend
npm install
npm start
```

Before starting, configure `GEMINI_API_KEY` and `MONGODB_URL` in the backend
environment (or in an untracked `backend/.env` file). The backend serves the
frontend at `http://localhost:5000`; when using a separate local frontend
server, the API also permits localhost origins.

## API endpoints

- `GET /api/health` — API health check
- `POST /api/readme/generate` — generate Markdown from submitted project details
- `POST /api/readme/history` — save generated Markdown to MongoDB
- `GET /api/readme/history` — list saved READMEs
- `GET /api/readme/history/:id` — retrieve a saved README
- `DELETE /api/readme/history/:id` — delete a saved README

## Render configuration

Configure the Render web service with:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables: `GEMINI_API_KEY`, `MONGODB_URL`, and `NODE_ENV=production`

`GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`. Render supplies
the `PORT` variable automatically. Keep credentials in Render's environment
settings; do not add them to frontend files or commit `.env` files.
