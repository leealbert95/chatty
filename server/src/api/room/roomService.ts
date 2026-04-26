import { v4 as uuidv4 } from "uuid";

import { lookupUserById } from "../userinfo/userInfoService";
import { Room, RoomMembership } from "@/db/roomModels";
import { User } from "@/db/userModels";
import { MemberDto, MemberType } from "@shared/room/member";
import { RoomDto, RoomType } from "@shared/room/room";

/** Either the user or group could not be found. */
class ResourceNotFoundError extends Error {}
class AlreadyJoinedError extends Error {}

/** The result of joining the room membership and user tables when looking up members of a room. */
type MembershipWithUser = RoomMembership & { User: User };

/**
 * Returns the member profiles of all members belonging to a room.
 * Executes an inner join with the User table to combine the necessary data for the member profile.
 */
const listMembersForRoom = async (roomId: string): Promise<MemberDto[]> => {
  return await RoomMembership.findAll({
    where: { roomId },
    attributes: ["userId", "membershipType", "createdAt"],
    include: [
      {
        model: User,
        required: true,
      },
    ],
  }).then((memberships) =>
    // Need intermediate cast as unknown since RoomMembership and MembershipWithUser are not directly compatible with each other.
    (memberships as unknown as MembershipWithUser[]).map(buildMemberDto),
  );
};

/**
 * Adds a user to an existing room with the given membership type.
 */
const addUserToRoom = async (
  roomId: string,
  userId: string,
  memberType: MemberType = MemberType.MEMBER,
): Promise<RoomDto> => {
  const user = lookupUserById(userId);
  if (user === null) {
    throw new ResourceNotFoundError(`User ${userId} not found`);
  }
  const room = await Room.findOne({ where: { roomId } });
  if (room === null)
    throw new ResourceNotFoundError(`Room ${roomId} not found`);
  const membership = await RoomMembership.findOne({
    where: { userId, roomId },
  });
  if (membership !== null) {
    throw new AlreadyJoinedError(
      `User ${userId} is already a member of room ${roomId}`,
    );
  }
  await RoomMembership.create({
    roomId,
    userId,
    membershipType: memberType,
  });
  return room.toRoomDto();
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
  const [room] = await Promise.all([
    Room.create({ roomId, name, type, createdAt: new Date() }),
    RoomMembership.create({
      roomId,
      userId,
      membershipType: MemberType.ADMIN,
    }),
  ]);
  return room.toRoomDto();
};

const buildMemberDto = (memberWithUser: MembershipWithUser): MemberDto => {
  const { userId, membershipType, createdAt } = memberWithUser;
  const user = memberWithUser.User;
  return {
    userId: userId,
    name: user.name,
    email: user.email,
    memberType: membershipType as MemberType,
    joinedAt: createdAt.toISOString(),
  } as MemberDto;
};

export { listMembersForRoom, addUserToRoom, createRoom, ResourceNotFoundError };
