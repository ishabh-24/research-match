# ResearchMatch

ResearchMatch connects participants with paid (or unpaid) university studies and gives researchers tools to publish studies and manage applicants.

## What the app currently does

- Participant dashboard with matched studies based on profile preferences.
- In-dashboard preference editing (interests, compensation, time, remote preference) with live match refresh.
- Participant applications view with statuses.
- Researcher dashboard with stats, applications, and quick access to own studies.
- Researcher study creation flow.
- Study browse + detailed study view.
- Landing page with featured studies and streamlined stats.

## Roles

- `PARTICIPANT`: browse studies, get matches, update profile preferences, apply/withdraw.
- `RESEARCHER`: create studies, review applicants, accept/reject applications.

## Tech stack

| Package | Stack | Port |
|---------|-------|------|
| `client/` | React + Vite + TypeScript | `5173` |
| `server/` | Node.js + Express + TypeScript | `4000` |

Database: PostgreSQL via Prisma (`server/prisma/`).

## Quick start

1. Install dependencies:

```bash
npm run install:all
```

2. Set environment variables:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Set up DB:

```bash
npm run db:push
npm run db:seed
```

4. Run app:

```bash
npm run dev
```

Client: `http://localhost:5173`  
Server: `http://localhost:4000`

## Important routes

### Frontend

- `/` landing page
- `/studies` browse studies
- `/studies/:id` detailed study view
- `/dashboard` participant dashboard
- `/participant/applications` participant applications
- `/researcher/dashboard` researcher dashboard
- `/researcher/studies/new` new study form

### API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/studies`
- `GET /api/studies/:id`
- `GET /api/studies/matches` (participant)
- `PUT /api/participant/profile` (participant)
- `GET /api/participant/applications` (participant)
- `POST /api/studies` (researcher)
- `GET /api/researcher/studies` (researcher)
- `GET /api/researcher/applications` (researcher)
- `PATCH /api/researcher/applications/:id` (researcher)

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server |
| `npm run install:all` | Install all dependencies |
| `npm run db:push` | Apply Prisma schema |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
