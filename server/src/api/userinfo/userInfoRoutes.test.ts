import express from "express";
import session from "express-session";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./userInfoService", () => ({
  listRoomsForUser: vi.fn(),
}));

import { listRoomsForUser } from "./userInfoService";
import { router } from "./userInfoRoutes";

const mockRoom = {
  roomId: "r-room-1",
  name: "General",
  type: "room",
  createdAt: "2024-01-01T00:00:00.000Z",
  memberType: "member",
};

const createApp = (userId?: string) => {
  const app = express();
  app.use(express.json());
  app.use(session({ secret: "test-secret", resave: false, saveUninitialized: false }));
  if (userId) {
    app.use((req: any, _res, next) => {
      req.session.userId = userId;
      next();
    });
  }
  app.use("/api/userinfo", router);
  return app;
};

beforeEach(() => vi.clearAllMocks());

describe("GET /api/userinfo/rooms", () => {
  it("returns 200 with the user's rooms", async () => {
    vi.mocked(listRoomsForUser).mockResolvedValue([mockRoom] as any);

    const res = await request(createApp("u-user-1")).get("/api/userinfo/rooms");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ rooms: [mockRoom], userId: "u-user-1" });
    expect(listRoomsForUser).toHaveBeenCalledWith("u-user-1");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(createApp()).get("/api/userinfo/rooms");

    expect(res.status).toBe(401);
  });

  it("returns 500 on an unexpected error", async () => {
    vi.mocked(listRoomsForUser).mockRejectedValue(new Error("Database error"));

    const res = await request(createApp("u-user-1")).get("/api/userinfo/rooms");

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
