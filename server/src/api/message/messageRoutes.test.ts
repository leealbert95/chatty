import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/service/messageService", () => ({
  listMessages: vi.fn(),
}));

import { listMessages } from "@/service/messageService";
import { router } from "./messageRoutes";

const mockMessages = [
  {
    messageId: "m-test-1",
    content: "Hello world",
    roomId: "room-1",
    sentBy: "u-sender-1",
    sentAt: "2024-01-01T12:00:00.000Z",
  },
];

const createApp = (authenticated = true) => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.session = { userId: authenticated ? "u-test-user" : undefined };
    next();
  });
  app.use("/api/message", router);
  return app;
};

beforeEach(() => vi.clearAllMocks());

describe("GET /api/message/:roomId/messages", () => {
  it("returns 200 with messages and nextPage when authenticated", async () => {
    vi.mocked(listMessages).mockResolvedValue(mockMessages);

    const res = await request(createApp()).get("/api/message/room-1/messages");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ messages: mockMessages, nextPage: 2 });
  });

  it("returns 401 when the request is not authenticated", async () => {
    const res = await request(createApp(false)).get("/api/message/room-1/messages");

    expect(res.status).toBe(401);
    expect(listMessages).not.toHaveBeenCalled();
  });

  it("passes page and pageSize query params to the service", async () => {
    vi.mocked(listMessages).mockResolvedValue([]);

    await request(createApp()).get("/api/message/room-1/messages?page=3&pageSize=20");

    expect(listMessages).toHaveBeenCalledWith("room-1", 3, 20);
  });

  it("defaults page to 1 and pageSize to 50 when not provided", async () => {
    vi.mocked(listMessages).mockResolvedValue([]);

    await request(createApp()).get("/api/message/room-1/messages");

    expect(listMessages).toHaveBeenCalledWith("room-1", 1, 50);
  });

  it("returns 500 on an unexpected service error", async () => {
    vi.mocked(listMessages).mockRejectedValue(new Error("Database connection lost"));

    const res = await request(createApp()).get("/api/message/room-1/messages");

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
