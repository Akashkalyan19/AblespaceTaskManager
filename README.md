# Pyramid — Task Management System

A full-stack task management application built for the AbleSpace full-stack developer
assessment. It implements the provided [Figma design](https://www.figma.com/design/obONCFmoTFN27V5H9PHS2X/Assessment-Task?node-id=0-1)
as a working product: guest login, tasks in list and board views, projects,
task detail with subtasks/comments/activity, and a persistent theme system.

---

## Project overview

Users enter through **guest login** and land in a workspace that is already
populated with demo projects and tasks, so the app feels real from the first
screen. From there they can create, edit, re-prioritise, re-assign, move and
delete tasks — either as grouped tables (list view) or as a drag-and-drop
kanban board — organise them into projects, and adjust their profile and theme.

Every guest gets **their own copy** of the demo data, so two people can try the
deployed app at the same time without seeing each other's changes.

---

## Features

**Tasks**
- List view: one collapsible table per status (To Do / Doing / Completed, plus
  On Hold and Backlog when they contain tasks)
- Board view: kanban columns with HTML5 drag-and-drop between statuses
  (optimistic update, rolled back if the request fails)
- Create, edit, delete tasks; inline editing of title and description
- Change status, priority, assignee and due date from the row `⋯` menu, from the
  board card, or from the task detail panel
- Subtasks (a task can contain tasks), comments, and an activity feed that
  records what changed ("changed priority from High to Urgent")
- Search with a `⌘F` / `Ctrl+F` shortcut, and filtering by priority
- "Fields" dropdown to switch between List/Board and toggle which fields are
  visible; the choice is remembered per view

**Projects**
- Projects table with priority, lead and due date, all editable in place
- Project detail page showing that project's tasks, with a breadcrumb

**Account & appearance**
- Guest login backed by a real JWT (no fake front-end-only auth)
- Settings area: profile (name, email, title, username), theme, accent colour
- Light and dark mode plus six accent colours, persisted across refreshes
- Leave Workspace deletes the guest account and all of its data

**Everywhere**
- Loading skeletons, error states with retry, empty states
- Client and server side validation, confirmation dialogs for deletes
- Responsive from 375px to 1440px+, keyboard accessible, WCAG AA contrast

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI        | Radix UI primitives styled in-house (shadcn/ui conventions), lucide-react icons |
| Data      | TanStack Query v5 |
| Backend   | NestJS 11, TypeScript |
| Database  | PostgreSQL with TypeORM (migrations, no `synchronize`) |
| Auth      | JWT via `@nestjs/jwt` + `passport-jwt` |
| Validation| class-validator DTOs behind a global `ValidationPipe` |
| Testing   | Jest + Supertest (backend e2e) |

Each dependency earns its place: Radix for accessible menus/dialogs/popovers,
TanStack Query for server-state caching and loading/error handling, sonner for
toasts, react-day-picker for the calendar in the design. There is no Redux,
no Docker, no GraphQL and no Redis — none of them were needed.

---

## Architecture

```
TaskMS/
├── backend/                    NestJS API (port 4000, prefix /api)
│   └── src/
│       ├── auth/               guest login, JWT strategy, guard, decorator
│       ├── users/              profile, demo member list
│       ├── projects/           project entity, service, controller, DTOs
│       ├── tasks/              task/comment/activity entities + endpoints
│       ├── common/             shared enums (TaskStatus, Priority)
│       ├── database/           data source, migrations, demo data, seed
│       └── main.ts             validation pipe, CORS, /api prefix
└── frontend/                   Next.js app (port 3000)
    └── src/
        ├── app/
        │   ├── login/          login screen
        │   ├── (app)/          authenticated shell: tasks, projects
        │   └── settings/       settings area with its own layout
        ├── components/
        │   ├── ui/             primitives (button, input, dialog, …)
        │   ├── layout/         sidebar, header, workspace menu
        │   ├── tasks/          list, board, pickers, dialogs, detail/
        │   ├── projects/       projects table, add-project dialog
        │   └── shared/         empty/error/loading states, confirm dialog
        └── lib/                api client, query hooks, types, theme, format
```

**Request flow.** A component calls a hook from `lib/queries.ts` → the hook calls
`api()` in `lib/api.ts` → `api()` attaches the JWT and normalises errors → NestJS
validates the DTO, the guard resolves the user, the service runs the business
logic scoped to that user, and TypeORM talks to Postgres.

**Ownership scoping.** Every task and project row has an `ownerId`. Services
always filter by the authenticated user's id, so one guest can never read or
modify another's data (there is an e2e test for exactly this).

**State.** Server data lives in TanStack Query. UI state (dialog open, collapsed
group) is local component state. Theme and view preferences live in
`localStorage` and on the `<html>` element. There is no global store, because
nothing needed one.

---

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally

### 1. Clone and install

```bash
git clone <repository-url>
cd TaskMS
```

```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### 2. Create the database

```bash
createdb taskms
```

### 3. Configure environment variables

Backend — copy `backend/.env.example` to `backend/.env` and adjust:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/taskms
JWT_SECRET=change-me-to-a-long-random-string
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

Frontend — copy `frontend/.env.example` to `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run migrations and seed

```bash
cd backend && npm run migration:run && npm run seed
```

`migration:run` creates the tables; `seed` inserts the shared demo member
accounts used as assignee options. Each guest's own projects and tasks are
created automatically at login.

### 5. Start both apps

```bash
cd backend && npm run start:dev
```

```bash
cd frontend && npm run dev
```

Open <http://localhost:3000> and click **Continue as Guest**.

### Useful scripts

| Command | Where | Purpose |
|---|---|---|
| `npm run start:dev` | backend | API with watch mode |
| `npm run build` | backend/frontend | production build |
| `npm run migration:run` / `migration:revert` | backend | apply / roll back migrations (dev, via ts-node) |
| `npm run migration:run:prod` | backend | apply migrations from the compiled build (used in deployment) |
| `npm run seed` | backend | insert demo member accounts |
| `npm run test:e2e` | backend | API test suite |
| `npm run dev` | frontend | Next.js dev server |
| `npm run lint` | frontend | ESLint |

---

## API

All routes are prefixed with `/api`. Every route except guest login requires
`Authorization: Bearer <token>`.

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/guest` | Create a guest account (optional `{ name }`), clone demo data, return `{ accessToken, user }` |

### Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me` | Current user |
| `PATCH` | `/users/me` | Update name / email / title / username |
| `DELETE` | `/users/me` | Delete the account and all of its data |
| `GET` | `/users/members` | Demo member accounts (assignee options) |

### Tasks
| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | Top-level tasks; optional `?projectId=`, `?status=`, `?search=` |
| `GET` | `/tasks/:id` | One task with its subtasks and project |
| `POST` | `/tasks` | Create a task (or a subtask with `parentId`) |
| `PATCH` | `/tasks/:id` | Partial update; logs activity for status/priority/date/assignee changes |
| `DELETE` | `/tasks/:id` | Delete a task and its subtasks |
| `GET` | `/tasks/:id/comments` | Comments, oldest first |
| `POST` | `/tasks/:id/comments` | Add a comment |
| `GET` | `/tasks/:id/activity` | Activity feed, newest first |

### Projects
| Method | Path | Description |
|---|---|---|
| `GET` | `/projects` | Projects; optional `?search=` |
| `GET` | `/projects/:id` | One project |
| `POST` | `/projects` | Create |
| `PATCH` | `/projects/:id` | Update |
| `DELETE` | `/projects/:id` | Delete (cascades to its tasks) |

**Status codes.** `200` reads and updates, `201` creates, `204` deletes,
`400` validation errors, `401` missing/invalid token, `404` not found (also
returned when a row belongs to another user, so ids are not enumerable).

Validation errors return the field messages, e.g.:

```json
{ "message": ["title must be longer than or equal to 1 characters"],
  "error": "Bad Request", "statusCode": 400 }
```

---

## Authentication (guest login)

1. The user clicks **Continue as Guest**.
2. `POST /api/auth/guest` creates a `users` row with `isGuest = true` and copies
   the demo projects, tasks, subtasks, comments and activity into that user's
   sandbox.
3. The API signs a JWT (`sub` = user id, 7-day expiry) and returns it with the user.
4. The frontend stores the token in `localStorage` and redirects to `/tasks`.
5. Every request sends `Authorization: Bearer <token>`. `JwtStrategy` verifies it
   and loads the user, which handlers receive through a `@CurrentUser()` decorator.
6. A `401` clears the token and sends the user back to the login screen.

The backend, not the frontend, decides who the user is — the token is verified on
every request and all queries are scoped to it. Adding real email/password or
Google sign-in later means adding another controller route that issues the same
kind of token; nothing else has to change.

---

## Theme system

- Tokens are CSS custom properties in `globals.css` (`--background`,
  `--foreground`, `--muted`, `--border`, `--primary`, …), exposed to Tailwind
  through `@theme inline`. Components only ever use semantic classes such as
  `bg-background` or `text-muted-foreground`, never raw hex values.
- **Light/dark** is a `dark` class on `<html>`.
- **Accent colour** is a `data-accent` attribute on `<html>` that re-points
  `--primary` and `--ring`, so all six accents work in both modes.
- Both are saved to `localStorage` and re-applied by a small inline script in
  the root layout that runs **before first paint**, so there is no flash of the
  wrong theme on reload.
- Changeable from the workspace menu (Change Theme / Color Mode) or the
  settings pages.

---

## Responsive design

Verified at 375, 768, 1024, 1280 and 1440px with no horizontal page overflow.

| Width | Behaviour |
|---|---|
| < 640px | Tables become stacked cards; toolbar wraps; sidebar is a slide-in sheet |
| 640–1023px | Tables return; sidebar still a sheet so content keeps the full width |
| ≥ 1024px | Inline collapsible sidebar (256px) beside the content |
| ≥ 1280px | Task detail shows the Details/Updates panel beside the main column |

The board scrolls horizontally by design — that is how the Figma board behaves —
but the page itself never does.

---

## Figma fidelity

The design was inspected frame by frame at 100% zoom before implementation, and
the built UI was then measured against it. Reproduced:

- **Login** — logo, 384px card, heading and sub-copy, black guest button,
  outlined Google button, terms text
- **List view** — status groups, table columns (Task / Priority / Members /
  Due Date / Actions), 48px rows, 44px headers, inline "+ Add Task" row
- **Board view** — 288px columns with drag handle, `+` and `⋯` (the Completed
  column's `+` is green, as in the design), white cards with title, member,
  red overdue date chip and label chips
- **Toolbar** — search that expands into an input with a `⌘F` badge, Fields
  dropdown with the List/Board switch and field toggles, filter, Add Task
- **Task detail** — title, description, Properties / Labels / Resources rows,
  subtasks table, comments, and the right-hand Details and Updates cards with
  the priority dropdown and the date-range calendar
- **Projects** — table with Lead column, row menu with property submenus,
  project detail with the `Projects › name` breadcrumb
- **Settings** — its own layout with "Back to app", search, Profile/Theme/Color
  nav, the profile card and the red Leave Workspace action
- **Tokens** — zinc palette, Geist typography, 8/10/14px radii, spacing scale

### Intentional deviations

| Deviation | Why |
|---|---|
| Priority label colours are darker than the mock | The mock's tints measured 2.15–3.76:1 contrast; they now clear WCAG AA (4.8–6.5:1) while keeping the red → orange → grey hierarchy |
| Avatars are generated initials, not photos | The Figma avatars are licensed stock images; initials on a per-user colour keep the repo self-contained |
| Comments section is titled "Comments" | The mock labels this second section "Subtasks", which is clearly a copy/paste slip — it shows comments |
| Projects page button reads "+ Add Project" | Two frames label it "+ Add Task"; one labels it "+ Add Project", which is the correct action |
| "Fields" dropdown lists Teams instead of a second Members row | The mock lists "Members" twice; the duplicate is dropped |
| No email field on the login screen | The mock's sub-copy mentions email but the design has no input — guest login is the required flow |
| Google button shows an explanatory toast | Real OAuth is out of scope for the assessment |
| Mobile layouts are original | The Figma contains desktop frames only; small screens use stacked cards rather than shrunken tables |
| Dark mode palette is original | Dark mode appears in the design only as a menu option, with no dark frames |
| Some "On Hold" card titles were completed | They are cut off at the frame edge in the design |

---

## Testing

**Backend** — `npm run test:e2e` runs 27 tests against a real database:
guest login and demo seeding, auth failures (missing and invalid token), task
CRUD, search, project scoping, subtask nesting, comments, activity logging,
DTO validation (empty title, unknown property, bad enum, malformed id, 404),
project CRUD with cascade delete, profile updates, and isolation between two
guests. All 27 pass.

**Frontend** — exercised manually in a browser: guest login, task creation with
validation errors, delete with confirmation, comment posting, drag-and-drop
between board columns (verified the new status persisted), search and empty
state, expired-token handling (token cleared, redirected to login), API-down
error state with retry, theme and accent persistence across reloads, and every
page at the five viewport widths.

**Builds** — `npm run build` succeeds for both apps; `tsc --noEmit` and ESLint
are clean, with no suppressed errors and no `any` in application code.

---

## Deployment

The two apps deploy independently.

**Database** — any managed Postgres (Neon, Supabase, Railway, RDS). Managed providers
require TLS, so append `?sslmode=require` to `DATABASE_URL`. The schema is applied
automatically on deploy (see below); demo member accounts are created on demand at first
guest login, so seeding is optional — run `npm run seed:prod` if you want them present up
front.

**Backend** — any Node host (Railway, Render, Fly.io):

```bash
npm ci && npm run build && npm run start:prod
```

`start:prod` runs the pending migrations against `DATABASE_URL` and then boots the API.
The migration and seed commands used in production (`migration:run:prod`, `seed:prod`)
run from the compiled `dist/` output, so they work on a host that installs without dev
dependencies — the plain `migration:run` / `seed` scripts rely on ts-node and are for
local development only.

Environment variables: `DATABASE_URL`, `JWT_SECRET` (a long random string),
`PORT`, `CORS_ORIGIN` (the deployed frontend URL). Managed Postgres usually
requires SSL — add `?sslmode=require` to `DATABASE_URL`.

**Frontend** — Vercel or any Node host:

```bash
npm ci && npm run build && npm start
```

Environment variable: `NEXT_PUBLIC_API_URL` — the deployed API URL including
`/api`.

Deployment configuration is documented here but has **not** been executed; the
project has only been run and verified locally.

---

## Security notes

- No secrets in the repository; `.env` is gitignored and `.env.example` documents
  every variable
- The JWT secret is required at startup (`getOrThrow`) — the app will not boot
  with a missing secret
- All input is validated on the server with `whitelist` and
  `forbidNonWhitelisted`, so unknown fields are rejected rather than persisted
- TypeORM parameterises every query; no string-built SQL
- Ownership is enforced server-side on every read and write
- CORS is restricted to the configured frontend origin

---

## Future improvements

Deliberately out of scope for this assessment:

- Real authentication (email/password, Google OAuth) and account linking
- Multiple assignees per task and real team membership
- File attachments for the "Resources" row and comment attachments
- Real-time updates (the design shows multiplayer cursors)
- Board column ordering and manual card ordering within a column
- Pagination or virtualised lists for very large workspaces
- Component and end-to-end frontend tests (Playwright)
- Scheduled cleanup of stale guest sandboxes
