import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvalidCredentialsCase } from "@shared/user/login";

vi.mock("@/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    userCredentials: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("../userinfo/userInfoService", () => ({
  lookUpUserByEmail: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid"),
}));

import bcrypt from "bcrypt";
import { prisma } from "@/prisma";
import { lookUpUserByEmail } from "../userinfo/userInfoService";
import {
  authenticateUser,
  InvalidCredentialsError,
  registerUser,
  UserAlreadyExistsError,
} from "./authService";

const mockUser = {
  userId: "u-test-123",
  name: "Test User",
  email: "test@example.com",
  profilePicture: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCredentials = {
  userId: mockUser.userId,
  password: "hashed-password",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

describe("registerUser", () => {
  it("creates and returns a new user when the email is not taken", async () => {
    vi.mocked(lookUpUserByEmail).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

    const result = await registerUser("Test User", "test@example.com", "password");

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        userId: "umock-uuid",
        name: "Test User",
        email: "test@example.com",
        credentials: { create: { password: "hashed-password" } },
      },
    });
  });

  it("throws UserAlreadyExistsError when the email is already registered", async () => {
    vi.mocked(lookUpUserByEmail).mockResolvedValue(mockUser as any);

    await expect(
      registerUser("Test User", "test@example.com", "password"),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("authenticateUser", () => {
  it("returns the user when credentials are valid", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.userCredentials.findFirst).mockResolvedValue(mockCredentials as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authenticateUser("test@example.com", "password");

    expect(result).toEqual(mockUser);
  });

  it("throws InvalidCredentialsError with USER_NOT_FOUND when the email does not exist", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const error = await authenticateUser("nobody@example.com", "password").catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(error.invalidCredentialsCase).toBe(InvalidCredentialsCase.USER_NOT_FOUND);
  });

  it("throws InvalidCredentialsError with USER_NOT_FOUND when the user has no credentials", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.userCredentials.findFirst).mockResolvedValue(null);

    const error = await authenticateUser("test@example.com", "password").catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(error.invalidCredentialsCase).toBe(InvalidCredentialsCase.USER_NOT_FOUND);
  });

  it("throws InvalidCredentialsError with WRONG_PASSWORD when the password does not match", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.userCredentials.findFirst).mockResolvedValue(mockCredentials as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const error = await authenticateUser("test@example.com", "wrong-password").catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(error.invalidCredentialsCase).toBe(InvalidCredentialsCase.WRONG_PASSWORD);
  });
});
