# TK NFC Boards

Application complète pour gérer des planches de kitesurf identifiées par NFC.

## Stack

- Frontend: Next.js + TypeScript
- Auth social web: Auth.js (NextAuth) Google/Facebook
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- DB: PostgreSQL
- Validation: Zod
- Tests: Vitest + Supertest
- Orchestration locale: Docker Compose

## Architecture du projet

- `api/`: API backend Express, Prisma schema/migrations/seed, tests
- `web/`: app Next.js (public, account, admin CMS)
- `docker-compose.yml`: services `db`, `api`, `web`, `mailhog`

## Modèle métier

Entités implémentées:

- `User`
- `BoardModel`
- `BoardVariant`
- `Board`
- `BoardClaim`
- `ScanLog`
- `ContactMessage`
- `SiteContent`

### Points clés

- séparation stricte `BoardModel` / `BoardVariant` / `Board`
- `publicId` et `serialNumber` uniques
- `publicUrl` générée automatiquement via `publicId`
- historique des claims/transferts (`BoardClaim`)
- historique des scans (`ScanLog`)
- formulaire public de contact sans exposition de données personnelles
- statuts board: `unclaimed`, `active`, `stolen`, `transferred`

## API

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/oauth` (bridge social login Auth.js -> token API)

### Public boards

- `GET /api/boards/:publicId/public`
- `POST /api/boards/:publicId/claim`
- `POST /api/boards/:publicId/contact`
- `POST /api/boards/:publicId/report-found`

### Account

- `GET /api/account/boards`
- `GET /api/account/boards/:id`
- `POST /api/account/boards/:id/report-stolen`
- `POST /api/account/boards/:id/clear-stolen`
- `POST /api/account/boards/:id/initiate-transfer`
- `GET /api/account/messages`

### Admin

- CRUD `/api/admin/models`
- CRUD `/api/admin/variants`
- CRUD `/api/admin/boards`
- `GET /api/admin/claims`
- `GET /api/admin/scans`
- `GET /api/admin/messages`
- CRUD `/api/admin/site-content`
- `GET /api/admin/users`
- `GET /api/admin/dashboard`

## UI/routes

### Public

- `/`
- `/board/[publicId]`
- `/login`
- `/register`

### Espace utilisateur

- `/account`
- `/account/boards`
- `/account/boards/[id]`

### Admin CMS

- `/admin/login`
- `/admin`
- `/admin/models`
- `/admin/variants`
- `/admin/boards`
- `/admin/users`
- `/admin/messages`
- `/admin/content`

## Anti-spam (contact public)

- validation Zod stricte
- rate-limit (`express-rate-limit`)
- honeypot (`website`)

## Seed de démo

Le seed crée:

- 1 admin (`admin@tk.com` / `Admin123!`)
- 1 user demo (`rider@tk.com` / `User12345!`)
- 3 modèles: TK01, TK02, TK03
- variantes de tailles (156, 158, etc.)
- 10 boards physiques
- contenus `SiteContent`

## Lancement rapide avec Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

URLs:

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000](http://localhost:4000)
- Mailhog: [http://localhost:8025](http://localhost:8025)

## OAuth social (Auth.js)

Le frontend supporte Google / Facebook / Apple via Auth.js (`/api/auth/[...nextauth]`).

Variables à configurer:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`

## Lancement local sans Docker

Prérequis: PostgreSQL local.

```bash
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Tests

Tests minimum backend:

- auth register/login
- public board endpoint
- claim flow
- contact form flow

Commande:

```bash
npm run test
```

## Remarques sécurité

- la page publique board n’expose jamais les données perso owner
- le contact passe uniquement via backend
- claims concurrents protégés par transaction + `updateMany` conditionnel

## Fichiers importants

- Prisma schema: `api/prisma/schema.prisma`
- Migration init: `api/prisma/migrations/20260306170000_init/migration.sql`
- Seed: `api/prisma/seed.ts`
- App Express: `api/src/app.ts`
- App Next: `web/src/app`
- Compose: `docker-compose.yml`
