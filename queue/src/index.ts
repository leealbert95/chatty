import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import { registerMessageSocketHandlers } from "./messages/messageSocketHandlers";
import { prisma } from "./prisma";

const PORT = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    // TODO: update origin to the main server URL when deploying
    // origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  registerMessageSocketHandlers(socket);
});

app.use(cors({ credentials: true }));
app.use(express.json());

prisma
  .$connect()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Queue running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Unable to connect to database:", err.message);
    process.exit(1);
  });
