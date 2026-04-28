import express from "express";
import session from "express-session";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/service/roomService", () => {
  class ResourceNotFoundError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ResourceNotFoundError";
    }
  }

  return {
    createRoom: vi.fn(),
    addUserToRoom: vi.fn(),
    listMembersForRoom: vi.fn(),
    ResourceNotFoundError,
  };
});

import {
  addUserToRoom,
  createRoom,
  listMembersForRoom,
  ResourceNotFoundError,
} from "@/service/roomService";
import { router } from "./roomRoutes";

const mockRoom = {
  roomId: "r-room-1",
  name: "General",
  type: "room",
  createdAt: "2024-01-01T00:00:00.000Z",
};

const mockMember = {
  userId: "u-user-1",
  name: "Alice",
  email: "alice@example.com",
  memberType: "member",
  joinedAt: "2024-06-01T00:00:00.000Z",
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
  app.use("/api/room", router);
  return app;
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/room/create", () => {
  it("returns 201 with the created room", async () => {
    vi.mocked(createRoom).mockResolvedValue(mockRoom as any);

    const res = await request(createApp("u-user-1"))
      .post("/api/room/create")
      .send({ name: "General", type: "room" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ room: mockRoom });
    expect(createRoom).toHaveBeenCalledWith("General", "room", "u-user-1");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(createApp())
      .post("/api/room/create")
      .send({ name: "General", type: "room" });

    expect(res.status).toBe(401);
  });

  it("returns 500 on an unexpected error", async () => {
    vi.mocked(createRoom).mockRejectedValue(new Error("Database error"));

    const res = await request(createApp("u-user-1"))
      .post("/api/room/create")
      .send({ name: "General", type: "room" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /api/room/:roomId/join", () => {
  it("returns 200 with the room on success", async () => {
    vi.mocked(addUserToRoom).mockResolvedValue(mockRoom as any);

    const res = await request(createApp("u-user-1"))
      .post("/api/room/r-room-1/join")
      .send({ memberType: "member" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ room: mockRoom });
    expect(addUserToRoom).toHaveBeenCalledWith("r-room-1", "u-user-1", "member");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(createApp()).post("/api/room/r-room-1/join").send({});

    expect(res.status).toBe(401);
  });

  it("returns 404 when the room does not exist", async () => {
    vi.mocked(addUserToRoom).mockRejectedValue(
      new ResourceNotFoundError("Room r-missing not found"),
    );

    const res = await request(createApp("u-user-1"))
      .post("/api/room/r-missing/join")
      .send({ memberType: "member" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  it("returns 500 on an unexpected error", async () => {
    vi.mocked(addUserToRoom).mockRejectedValue(new Error("Database error"));

    const res = await request(createApp("u-user-1"))
      .post("/api/room/r-room-1/join")
      .send({ memberType: "member" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("GET /api/room/:roomId/members", () => {
  it("returns 200 with the member list", async () => {
    vi.mocked(listMembersForRoom).mockResolvedValue([mockMember] as any);

    const res = await request(createApp("u-user-1")).get("/api/room/r-room-1/members");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ members: [mockMember], roomId: "r-room-1" });
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(createApp()).get("/api/room/r-room-1/members");

    expect(res.status).toBe(401);
  });

  it("returns 404 when the service throws", async () => {
    vi.mocked(listMembersForRoom).mockRejectedValue(new Error("Not found"));

    const res = await request(createApp("u-user-1")).get("/api/room/r-room-1/members");

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /api/room/:roomId/add", () => {
  it("returns 200 with the room on success", async () => {
    vi.mocked(addUserToRoom).mockResolvedValue(mockRoom as any);

    const res = await request(createApp("u-user-1"))
      .post("/api/room/r-room-1/add")
      .send({ userId: "u-user-2", memberType: "member" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ room: mockRoom });
    expect(addUserToRoom).toHaveBeenCalledWith("r-room-1", "u-user-2", "member");
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(createApp())
      .post("/api/room/r-room-1/add")
      .send({ userId: "u-user-2", memberType: "member" });

    expect(res.status).toBe(401);
  });

  it("returns 404 when the room does not exist", async () => {
    vi.mocked(addUserToRoom).mockRejectedValue(
      new ResourceNotFoundError("Room r-missing not found"),
    );

    const res = await request(createApp("u-user-1"))
      .post("/api/room/r-missing/add")
      .send({ userId: "u-user-2", memberType: "member" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
