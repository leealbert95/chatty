import { prisma } from "@/prisma";
import { RoomWithMembershipDto } from "@shared/room/listRooms";
import { MemberType } from "@shared/room/member";
import { RoomType } from "@shared/room/room";

/** Returns the user with the given email, or null if not found. */
const lookUpUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({ where: { email } });
};

/** Returns the user with the given id, or null if not found. */
const lookupUserById = async (userId: string) => {
  return await prisma.user.findFirst({ where: { userId } });
};

/**
 * Returns all rooms that the given user is a member of.
 */
const listRoomsForUser = async (
  userId: string,
): Promise<RoomWithMembershipDto[]> => {
  const memberships = await prisma.roomMembership.findMany({
    where: { userId },
    include: { room: true },
  });

  return memberships.map((m) => ({
    roomId: m.roomId,
    name: m.room.name,
    type: m.room.type as unknown as RoomType,
    createdAt: m.room.createdAt.toISOString(),
    memberType: m.membershipType as unknown as MemberType,
  }));
};

export { listRoomsForUser, lookUpUserByEmail, lookupUserById };
