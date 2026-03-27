# ResearchMatch

A two-sided marketplace connecting university researchers with study participants.

## Architecture

Monorepo with two packages:

| Package | Stack | Port |
|---------|-------|------|
| `client/` | React + Vite + TypeScript | 5173 |
| `server/` | Node.js + Express + TypeScript | 4000 |

**Database**: PostgreSQL via Prisma ORM (config in `server/prisma/`)

## Getting Started

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Configure environment

**Server** — copy and fill in `server/.env`:
```bash
cp server/.env.example server/.env
```

**Client** — copy and fill in `client/.env`:
```bash
cp client/.env.example client/.env
```

### 3. Set up the database
```bash
npm run db:push      # apply schema to the DB
npm run db:seed      # populate with test data
npm run db:studio    # optional: Prisma Studio GUI
```

### 4. Run both servers concurrently
```bash
npm run dev
# Client: http://localhost:5173
# Server: http://localhost:4000
```

Or run individually:
```bash
cd client && npm run dev   # React (Vite)
cd server && npm run dev   # Express (ts-node + nodemon)
```

## Project Structure

```
researchmatch/
├── client/                   # React + Vite frontend
│   └── src/
│       ├── App.tsx           # Root router (react-router-dom)
│       ├── pages/            # One file per page/route
│       │   ├── Landing.tsx
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Studies.tsx
│       │   ├── StudyDetail.tsx
│       │   ├── ProfileSetup.tsx
│       │   ├── participant/Applications.tsx
│       │   └── researcher/
│       │       ├── Dashboard.tsx
│       │       └── NewStudy.tsx
│       ├── components/       # Reusable UI components
│       └── lib/
│           ├── api.ts        # Axios client → Express server
│           └── auth.ts       # JWT storage helpers
│
├── server/                   # Node.js + Express backend
│   └── src/
│       ├── index.ts          # Express entry point
│       ├── routes/           # One router per resource
│       │   ├── auth.ts       # POST /auth/register, /auth/login
│       │   ├── studies.ts    # GET/POST /studies + /studies/matches
│       │   ├── applications.ts
│       │   ├── participant.ts
│       │   ├── researcher.ts
│       │   └── notifications.ts
│       ├── middleware/
│       │   └── auth.ts       # JWT verify (requireAuth, requireRole)
│       └── lib/              # Shared business logic
│           ├── prisma.ts
│           ├── matching.ts
│           ├── email.ts
│           ├── validations.ts
│           └── utils.ts
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in, receive JWT |
| GET | `/api/studies` | — | Browse published studies |
| GET | `/api/studies/matches` | PARTICIPANT | Smart-matched studies |
| GET | `/api/studies/:id` | — | Study detail |
| POST | `/api/studies` | RESEARCHER | Create study |
| POST | `/api/applications/:studyId` | PARTICIPANT | Apply to study |
| DELETE | `/api/applications/:studyId` | PARTICIPANT | Withdraw application |
| GET | `/api/participant/profile` | PARTICIPANT | Get profile |
| PUT | `/api/participant/profile` | PARTICIPANT | Update profile |
| GET | `/api/participant/applications` | PARTICIPANT | My applications |
| GET | `/api/researcher/studies` | RESEARCHER | My studies |
| PATCH | `/api/researcher/applications/:id` | RESEARCHER | Accept/reject |
| GET | `/api/notifications` | any | Notifications |

## User Roles

| Role | Access |
|------|--------|
| `PARTICIPANT` | Browse studies, apply, manage profile |
| `RESEARCHER` | Create/manage studies, review applicants |
| `ADMIN` | (future) Verify researchers, moderate |

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both client + server |
| `npm run install:all` | Install all dependencies |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed test data |
