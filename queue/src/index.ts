import cors from "cors";
import express from "express";
import http from "http";

import { router as messageRoutes } from "@/messages/routes";
import { prisma } from "@/prisma";

const PORT = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ credentials: true }));
app.use(express.json());

app.use("/api/message", messageRoutes);

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
