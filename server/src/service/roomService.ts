import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/prisma";
import {
  MemberType as PrismaMemberType,
  RoomType as PrismaRoomType,
} from "@prisma/client";
import { MemberDto, MemberType } from "@shared/room/member";
import { RoomDto, RoomType } from "@shared/room/room";

/** Thrown when a referenced room or user does not exist. */
class ResourceNotFoundError extends Error {}

/** Thrown when a user attempts to join a room they already belong to. */
class AlreadyJoinedError extends Error {}

/**
 * Returns the member profiles of all members belonging to a room.
 */
const listMembersForRoom = async (roomId: string): Promise<MemberDto[]> => {
  const memberships = await prisma.roomMembership.findMany({
    where: { roomId },
    include: { user: true },
  });

  return memberships.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    memberType: m.membershipType as unknown as MemberType,
    joinedAt: m.createdAt.toISOString(),
  }));
};

/**
 * Adds a user to an existing room with the given membership type.
 */
const addUserToRoom = async (
  roomId: string,
  userId: string,
  memberType: MemberType = MemberType.MEMBER,
): Promise<RoomDto> => {
  const [room, existingMembership] = await Promise.all([
    prisma.room.findFirst({ where: { roomId } }),
    prisma.roomMembership.findFirst({ where: { userId, roomId } }),
  ]);

  if (room === null)
    throw new ResourceNotFoundError(`Room ${roomId} not found`);
  if (existingMembership !== null)
    throw new AlreadyJoinedError(
      `User ${userId} is already a member of room ${roomId}`,
    );

  await prisma.roomMembership.create({
    data: {
      roomId,
      userId,
      membershipType: memberType as unknown as PrismaMemberType,
    },
  });

  return {
    roomId: room.roomId,
    name: room.name,
    type: room.type as unknown as RoomType,
    createdAt: room.createdAt.toISOString(),
  };
};

/**
 * Creates a new room and adds the creator as an admin member.
 */
const createRoom = async (
  name: string,
  type: RoomType,
  userId: string,
): Promise<RoomDto> => {
  const roomId = `r${uuidv4()}`;

  const room = await prisma.room.create({
    data: {
      roomId,
      name,
      type: type as unknown as PrismaRoomType,
      memberships: {
        create: {
          userId,
          membershipType: MemberType.ADMIN as unknown as PrismaMemberType,
        },
      },
    },
  });

  return {
    roomId: room.roomId,
    name: room.name,
    type: room.type as unknown as RoomType,
    createdAt: room.createdAt.toISOString(),
  };
};

export { listMembersForRoom, addUserToRoom, createRoom, ResourceNotFoundError };
