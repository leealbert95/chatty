import "./session";

import cors from "cors";
import { CipherKey } from "crypto";
import express from "express";
import session from "express-session";
import http from "http";
import sessionFileStore from "session-file-store";
import { Server } from "socket.io";

import { router as authRoutes } from "@/api/auth/authRoutes";
import { router as messageRoutes } from "@/api/message/messageRoutes";
import { router as roomRoutes } from "@/api/room/roomRoutes";
import { router as userInfoRoutes } from "@/api/userinfo/userInfoRoutes";
import { prisma } from "@/prisma";
import { registerRoomSocketHandlers } from "@/socket/socketHandlers";
import { NodeEnv } from "@shared/environment/env";

const PORT = process.env.PORT;

const app = express();
const FileStore = sessionFileStore(session); // TODO: Use redis for prod
const httpServer = http.createServer(app);
const sessionStore = new FileStore({
  path: "./sessions",
  retries: 0,
});
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as CipherKey,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === NodeEnv.PROD,
    maxAge: 24 * 60 * 60 * 1000,
  },
});

const io = new Server(httpServer, {
  cors: {
    // TODO: update origin to the AWS frontend URL when deploying
    // origin: "http://localhost:5173",
    credentials: true,
  },
});
io.engine.use(sessionMiddleware);

app.use(
  cors({
    // origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/userinfo", userInfoRoutes);

io.on("connection", (socket) => {
  registerRoomSocketHandlers(socket);
});
prisma
  .$connect()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Unable to connect to database:", err.message);
    process.exit(1);
  });
