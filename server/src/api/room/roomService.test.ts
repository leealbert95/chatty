import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/prisma", () => ({
  prisma: {
    roomMembership: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    room: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid"),
}));

import { prisma } from "@/prisma";
import { MemberType } from "@shared/room/member";
import { RoomType } from "@shared/room/room";
import {
  addUserToRoom,
  createRoom,
  listMembersForRoom,
  ResourceNotFoundError,
} from "./roomService";

const mockRoom = {
  roomId: "r-room-1",
  name: "General",
  type: "room",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date(),
};

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
  createdAt: new Date("2024-06-01T00:00:00.000Z"),
  updatedAt: new Date(),
  user: mockUser,
  room: mockRoom,
};

beforeEach(() => vi.clearAllMocks());

describe("listMembersForRoom", () => {
  it("returns mapped MemberDtos for all memberships in the room", async () => {
    vi.mocked(prisma.roomMembership.findMany).mockResolvedValue([mockMembership] as any);

    const result = await listMembersForRoom("r-room-1");

    expect(result).toEqual([
      {
        userId: "u-user-1",
        name: "Alice",
        email: "alice@example.com",
        memberType: "member",
        joinedAt: "2024-06-01T00:00:00.000Z",
      },
    ]);
    expect(prisma.roomMembership.findMany).toHaveBeenCalledWith({
      where: { roomId: "r-room-1" },
      include: { user: true },
    });
  });

  it("returns an empty array when the room has no members", async () => {
    vi.mocked(prisma.roomMembership.findMany).mockResolvedValue([]);

    const result = await listMembersForRoom("r-room-1");

    expect(result).toEqual([]);
  });
});

describe("addUserToRoom", () => {
  it("creates the membership and returns the room DTO", async () => {
    vi.mocked(prisma.room.findFirst).mockResolvedValue(mockRoom as any);
    vi.mocked(prisma.roomMembership.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.roomMembership.create).mockResolvedValue(undefined as any);

    const result = await addUserToRoom("r-room-1", "u-user-1", MemberType.MEMBER);

    expect(prisma.roomMembership.create).toHaveBeenCalledWith({
      data: { roomId: "r-room-1", userId: "u-user-1", membershipType: MemberType.MEMBER },
    });
    expect(result).toEqual({
      roomId: "r-room-1",
      name: "General",
      type: "room",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });

  it("defaults to MEMBER type when memberType is not provided", async () => {
    vi.mocked(prisma.room.findFirst).mockResolvedValue(mockRoom as any);
    vi.mocked(prisma.roomMembership.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.roomMembership.create).mockResolvedValue(undefined as any);

    await addUserToRoom("r-room-1", "u-user-1");

    expect(prisma.roomMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ membershipType: MemberType.MEMBER }) }),
    );
  });

  it("throws ResourceNotFoundError when the room does not exist", async () => {
    vi.mocked(prisma.room.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.roomMembership.findFirst).mockResolvedValue(null);

    await expect(addUserToRoom("r-missing", "u-user-1")).rejects.toThrow(ResourceNotFoundError);
  });

  it("throws AlreadyJoinedError when the user is already a member", async () => {
    vi.mocked(prisma.room.findFirst).mockResolvedValue(mockRoom as any);
    vi.mocked(prisma.roomMembership.findFirst).mockResolvedValue(mockMembership as any);

    await expect(addUserToRoom("r-room-1", "u-user-1")).rejects.toThrow("already a member");
  });
});

describe("createRoom", () => {
  it("creates a room with a prefixed uuid and adds the creator as ADMIN", async () => {
    vi.mocked(prisma.room.create).mockResolvedValue(mockRoom as any);

    const result = await createRoom("General", RoomType.ROOM, "u-user-1");

    expect(prisma.room.create).toHaveBeenCalledWith({
      data: {
        roomId: "rmock-uuid",
        name: "General",
        type: RoomType.ROOM,
        memberships: {
          create: { userId: "u-user-1", membershipType: MemberType.ADMIN },
        },
      },
    });
    expect(result).toEqual({
      roomId: "r-room-1",
      name: "General",
      type: "room",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });
});
