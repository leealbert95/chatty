# Chatty

## About

Chatty is a real-time chat application that allows users to communicate in rooms and direct messages. It supports user authentication, room membership management, and live messaging via WebSockets. The purpose of this app is to practice implementing system design concepts using a real web application.

## Tech stack

### Client

* Typescript
* React
* Sass
* SocketIO (for websocket connections)

### Server

* Nodejs
* SocketIO (for websocket connections)
* Prisma (database connection)

### Database
* MySQL (User and room information)
* MongoDB (Messages)

## How to set up

### Server

**1. Install dependencies**

```bash
cd server
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string (e.g. `mysql://user:password@localhost:3306/chatty`). This will be auto-generated when running prisma init. |
| `SESSION_SECRET` | Secret key used to sign session cookies |
| `PORT` | Port the server listens on (e.g. `3001`) |

**3. Initialize Prisma**

Initialize prisma. This will generate the DATABASE_URL variable in the .env file, which you must update with your own database connection credentials:

```bash
npx prisma init
```

Run the database migrations to create the schema:

```bash
npx prisma migrate dev
```

Optionally seed the database with sample data:

```bash
npx prisma db seed
```

Then run prisma generate to generate the prisma client code. Depending on the prisma version the output may be generated under node_modules or in a /generated folder in the server folder.

```bash
npx prisma generate 
```

**4. Available commands**

| Command | Description |
|---|---|
| `npm run dev` | Start the server in watch mode |
| `npm run dev:debug` | Start the server with the Node.js inspector attached on port 9229 |
| `npm test` | Run the test suite |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start the compiled server (requires `npm run build` first) |
