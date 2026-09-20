<div align="center">

# 📦 boxley

**A REST API for file storage with JWT authentication — built to run locally and on serverless.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest%2030-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

</div>

Boxley is a pet-project backend that combines two things people actually deploy: **authentication** (JWT access + refresh tokens bound to a device) and **file storage** (any S3-compatible object store, MinIO out of the box). It ships with Swagger docs, integration tests, and a Vercel-ready configuration.

## ✨ Features

- 🔐 **JWT auth** — access + refresh tokens, refresh tokens are bound to a device, expired tokens are cleaned up by a background job
- 📁 **File storage** — upload, list (paginated), fetch, download, and delete files via an S3-compatible API (MinIO-compatible)
- 🧑 **Users** — CRUD endpoints guarded by an "owner only" middleware
- 📚 **Swagger docs** — auto-generated from JSDoc, served at `/api/docs`
- ✅ **Tests** — unit + integration (Jest + Supertest) against a real MySQL and MinIO from Docker Compose
- ▲ **Serverless-ready** — deploys to Vercel as-is (`vercel.json` included)

## 🛠 Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Runtime    | Node.js, Express 5, TypeScript                                |
| Database   | MySQL 8 via Prisma 7 (driver adapter `@prisma/adapter-mariadb`) |
| Storage    | Any S3-compatible store via AWS SDK v3 (MinIO for local dev)   |
| Validation | Joi + custom validation middleware                             |
| Testing    | Jest 30, Supertest                                             |
| Infra      | Docker Compose (MySQL dev + MySQL test + MinIO), Vercel        |

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- Node.js 20+

### 1. Spin up the infrastructure

Starts MySQL (dev, port `3306`), MySQL (test, port `3307`) and MinIO (`:9000`, console at `:9001`):

```bash
docker-compose up -d
```

### 2. Push the database schema

```bash
npm run db:push
```

### 3. Run the app

```bash
npm install   # prisma generate runs automatically on postinstall
npm run dev
```

The API is now live at `http://localhost:3000` — open the Swagger UI at **http://localhost:3000/api/docs**.

## 🔑 Environment Variables

Configure via a local `.env` (or project settings on Vercel for deployment).

| Variable                          | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| `JWT_SECRET`                      | Secret used to sign access/refresh tokens            |
| `DATABASE_URL`                    | MySQL connection string (`mysql://user:pass@host:port/db`) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Credentials for the S3-compatible store       |
| `MINIO_DEFAULT_BUCKET`            | Bucket where uploaded files are stored               |
| `MINIO_ENDPOINT`                  | Store endpoint (defaults to `http://localhost:9000`) |
| `PORT`                            | Local server port (defaults to `3000`)               |

## 📡 API Overview

| Method   | Endpoint                    | Description                              | Auth     |
| -------- | --------------------------- | ---------------------------------------- | -------- |
| `POST`   | `/api/auth/signup`          | Register a user (id is generated server-side) | —   |
| `POST`   | `/api/auth/signin`          | Log in, get access + refresh tokens      | —        |
| `POST`   | `/api/auth/signin/new_token`| Refresh the access token                 | —        |
| `GET`    | `/api/auth/info`            | Get current user info                    | Bearer   |
| `POST`   | `/api/auth/logout`          | Log out on a device                      | Bearer   |
| `POST`   | `/api/file/upload`          | Upload a file (`multipart/form-data`)    | Bearer   |
| `GET`    | `/api/file`                 | List files (paginated: `page`, `limit`)  | Bearer   |
| `GET`    | `/api/file/:id`             | Get file metadata                        | Bearer   |
| `GET`    | `/api/file/download/:id`    | Download a file                          | Bearer   |
| `DELETE` | `/api/file/:id`             | Delete a file (owner only)               | Bearer   |
| `POST`   | `/api/user`                 | Create a user                            | —        |
| `GET`    | `/api/user/:id`             | Get user by id (self only)               | Bearer   |
| `PUT`    | `/api/user/:id`             | Update user (self only)                  | Bearer   |
| `DELETE` | `/api/user/:id`             | Delete user (self only)                  | Bearer   |

> Full request/response schemas are in the Swagger UI at `/api/docs`.

## 🧪 Running Tests

Tests run against the test MySQL (port `3307`) and MinIO from Docker Compose:

```bash
npx dotenv -e .env.test -- prisma db push   # push schema to the test database
npm test                                    # dotenv -e .env.test -- jest -i
```

## ☁️ Deploying to Vercel

The deployment config already lives in [`vercel.json`](./vercel.json): the app is built with `@vercel/node` from `src/index.ts` (on Vercel it exports the Express app instead of calling `app.listen`).

### Managed services

Vercel has no MySQL or MinIO, so wire up managed counterparts:

- **MySQL** — e.g. [PlanetScale](https://planetscale.com) or [Aiven](https://aiven.io). (Postgres works too, but you'd need to switch the `provider` in `prisma/schema.prisma` and the adapter to `@prisma/adapter-pg`.)
- **S3** — any S3-compatible store: [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible endpoint in the bucket settings), Backblaze B2, or AWS S3.

### Steps

1. Push the repository to GitHub.
2. In Vercel: **Add New Project** → import the repo, name the project `boxley` (gives you `boxley.vercel.app`).
3. Under **Settings → Environment Variables**, set `JWT_SECRET`, `DATABASE_URL`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_DEFAULT_BUCKET`, `MINIO_ENDPOINT`.
4. Push the schema to the managed database from your machine:
   ```bash
   DATABASE_URL="<connection string from PlanetScale/Aiven>" npm run db:push
   ```
5. Deploy. 🎉

### Serverless caveats

- **node-cron doesn't tick on Vercel**: serverless functions are ephemeral, so the in-process refresh-token cleanup job never runs. Options: a [Vercel Cron Job](https://vercel.com/docs/cron-jobs) hitting an endpoint that calls `deactivateExpiredTokens`, or invalidating by `expiresAt` when a refresh token is used (partially done in `refreshToken`).
- First requests after idle are slow (serverless cold start).

## 🗂 Project Structure

```
src/
├── config/          # env config, Swagger setup
├── controllers/     # request handlers
├── middlewares/     # auth, validation, error handling, CORS
├── routes/          # Express routers
├── services/        # business logic (auth, files, users)
├── validations/     # Joi schemas
├── tasks/           # cron jobs (refresh-token cleanup)
└── db/              # Prisma client
tests/
├── integration/     # API tests against real MySQL + MinIO
├── unit/
└── utils/           # test DB setup helpers
```

## 📄 License

[ISC](./package.json)
