import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
    roomMembership: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/prisma";
import { listRoomsForUser, lookUpUserByEmail, lookupUserById } from "./userInfoService";

const mockUser = {
  userId: "u-user-1",
  name: "Alice",
  email: "alice@example.com",
  profilePicture: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMembership = {
  userId: "u-user-1",
  roomId: "r-room-1",
  membershipType: "member",
  createdAt: new Date(),
  updatedAt: new Date(),
  room: {
    roomId: "r-room-1",
    name: "General",
    type: "room",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date(),
  },
};

beforeEach(() => vi.clearAllMocks());

describe("lookUpUserByEmail", () => {
  it("returns the user when found", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

    const result = await lookUpUserByEmail("alice@example.com");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: "alice@example.com" },
    });
  });

  it("returns null when no user matches the email", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const result = await lookUpUserByEmail("nobody@example.com");

    expect(result).toBeNull();
  });
});

describe("lookupUserById", () => {
  it("returns the user when found", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

    const result = await lookupUserById("u-user-1");

    expect(result).toEqual(mockUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { userId: "u-user-1" },
    });
  });

  it("returns null when no user matches the id", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const result = await lookupUserById("u-missing");

    expect(result).toBeNull();
  });
});

describe("listRoomsForUser", () => {
  it("returns mapped RoomWithMembershipDtos for all memberships", async () => {
    vi.mocked(prisma.roomMembership.findMany).mockResolvedValue([mockMembership] as any);

    const result = await listRoomsForUser("u-user-1");

    expect(result).toEqual([
      {
        roomId: "r-room-1",
        name: "General",
        type: "room",
        createdAt: "2024-01-01T00:00:00.000Z",
        memberType: "member",
      },
    ]);
    expect(prisma.roomMembership.findMany).toHaveBeenCalledWith({
      where: { userId: "u-user-1" },
      include: { room: true },
    });
  });

  it("returns an empty array when the user belongs to no rooms", async () => {
    vi.mocked(prisma.roomMembership.findMany).mockResolvedValue([]);

    const result = await listRoomsForUser("u-user-1");

    expect(result).toEqual([]);
  });
});
