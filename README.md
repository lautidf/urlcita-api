# URLcita API

A REST API for shortening URLs, managing links, and tracking click statistics.

**Live API:** https://urlcita-api.onrender.com/ 
**Swagger UI:** https://urlcita-api.onrender.com/docs

## Features

- User registration and authentication using JWT.
- Create custom short URLs.
- Retrieve and manage your links.
- Track link clicks and retrieve usage statistics.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **API Documentation:** OpenAPI / Swagger UI
- **Testing:** Vitest and Supertest

## Getting Started

### Prerequisites

- Node.js 26.13.1
- Docker and Docker Compose
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/urlcita"
JWT_SECRET=""
API_URL=""
PORT=""
```

### Database Setup

The project uses Docker Compose to run two PostgreSQL instances:
- **Development database:** `urlcita` (port `5433`).
- **Test database:** `urlcita_test` (port `5434`).

Start both databases:

```bash
docker compose up -d
```

Run the database migrations and generate the Prisma client:

```bash
npm run prisma:migrate:dev
```

### Run the Application

```bash
npm run dev
```

The API will be available at `http://localhost:[PORT]`.

## API Documentation

Interactive API documentation is available through Swagger UI:

```text
/docs
```

It describes the available endpoints, request parameters, request bodies, and responses.

## Running Tests

```bash
npm run test:integration
```

## Roadmap

- Link expiration
- Background jobs for expired link cleanup
- Redis caching
- Rate limiting
- QR code generation