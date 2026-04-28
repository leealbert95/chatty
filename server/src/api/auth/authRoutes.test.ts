import express from "express";
import session from "express-session";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvalidCredentialsCase } from "@shared/user/login";

vi.mock("@/service/authService", () => {
  class UserAlreadyExistsError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "UserAlreadyExistsError";
    }
  }

  class InvalidCredentialsError extends Error {
    invalidCredentialsCase: string;
    constructor(invalidCredentialsCase: string, message: string) {
      super(message);
      this.name = "InvalidCredentialsError";
      this.invalidCredentialsCase = invalidCredentialsCase;
    }
  }

  return {
    registerUser: vi.fn(),
    authenticateUser: vi.fn(),
    UserAlreadyExistsError,
    InvalidCredentialsError,
  };
});

import {
  authenticateUser,
  InvalidCredentialsError,
  registerUser,
  UserAlreadyExistsError,
} from "@/service/authService";
import { router } from "./authRoutes";

const mockUser = {
  userId: "u-test-123",
  name: "Test User",
  email: "test@example.com",
  profilePicture: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(
    session({ secret: "test-secret", resave: false, saveUninitialized: false }),
  );
  app.use("/api/auth", router);
  app.get("/_session", (req: any, res) => res.json({ userId: req.session.userId }));
  return app;
};

const createAppWithFailingSession = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.session = {
      destroy: (cb: (err: Error | null) => void) => cb(new Error("Store error")),
    };
    next();
  });
  app.use("/api/auth", router);
  return app;
};

describe("POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 and the new user on success", async () => {
    vi.mocked(registerUser).mockResolvedValue(mockUser as any);

    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: mockUser.userId,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it("sets userId in session after successful registration", async () => {
    vi.mocked(registerUser).mockResolvedValue(mockUser as any);

    const agent = request.agent(createApp());
    await agent
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password" });

    const sessionRes = await agent.get("/_session");
    expect(sessionRes.body.userId).toBe(mockUser.userId);
  });

  it("returns 409 when the email is already registered", async () => {
    vi.mocked(registerUser).mockRejectedValue(
      new UserAlreadyExistsError("User with email test@example.com already exists"),
    );

    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password" });

    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it("returns 500 on an unexpected error", async () => {
    vi.mocked(registerUser).mockRejectedValue(new Error("Database connection lost"));

    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "password" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 and the user on success", async () => {
    vi.mocked(authenticateUser).mockResolvedValue(mockUser as any);

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: mockUser.userId,
      name: mockUser.name,
      email: mockUser.email,
    });
  });

  it("sets userId in session after successful login", async () => {
    vi.mocked(authenticateUser).mockResolvedValue(mockUser as any);

    const agent = request.agent(createApp());
    await agent
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    const sessionRes = await agent.get("/_session");
    expect(sessionRes.body.userId).toBe(mockUser.userId);
  });

  it("returns 401 with USER_NOT_FOUND reason when the email does not exist", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(
      new InvalidCredentialsError(InvalidCredentialsCase.USER_NOT_FOUND, "User not found"),
    );

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password" });

    expect(res.status).toBe(401);
    expect(res.body.reason).toBe(InvalidCredentialsCase.USER_NOT_FOUND);
  });

  it("returns 401 with WRONG_PASSWORD reason when the password is incorrect", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(
      new InvalidCredentialsError(InvalidCredentialsCase.WRONG_PASSWORD, "Wrong password"),
    );

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.reason).toBe(InvalidCredentialsCase.WRONG_PASSWORD);
  });

  it("returns 500 on an unexpected error", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(new Error("Database connection lost"));

    const res = await request(createApp())
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 with a logout confirmation message", async () => {
    const res = await request(createApp()).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out");
  });

  it("returns 500 when the session store fails to destroy the session", async () => {
    const res = await request(createAppWithFailingSession()).post("/api/auth/logout");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to log out");
  });
});
