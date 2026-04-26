import { Room, RoomMembership } from "@/db/roomModels";
import { User } from "@/db/userModels";
import { RoomWithMembershipDto } from "@shared/room/listRooms";
import { MemberType } from "@shared/room/member";
import { RoomType } from "@shared/room/room";

// The union type resulting from querying an inner join of the room membership to room tables
type RoomWithMembership = RoomMembership & {
  Room: Room;
};

const lookUpUserByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({ where: { email } });
};

const lookupUserById = async (userId: string): Promise<User | null> => {
  return await User.findOne({ where: { userId } });
};

/**
 * Returns all rooms that the given user is a member of.
 */
const listRoomsForUser = async (
  userId: string,
): Promise<RoomWithMembershipDto[]> => {
  return await RoomMembership.findAll({
    where: { userId },
    attributes: ["roomId", "membershipType"],
    include: [{ model: Room, required: true }],
  }).then((results) =>
    // Need intermediate cast since RoomMembership and RoomWithMembership are incompatible types
    (results as unknown as RoomWithMembership[]).map(
      buildRoomWithMembershipDto,
    ),
  );
};

const buildRoomWithMembershipDto = (
  roomWithMembership: RoomWithMembership,
): RoomWithMembershipDto => {
  const { roomId, membershipType } = roomWithMembership;
  const room = roomWithMembership.Room;

  return {
    roomId: roomId,
    name: room.name,
    type: room.type as RoomType,
    createdAt: room.createdAt.toISOString(),
    memberType: membershipType as MemberType,
  };
};

export { listRoomsForUser, lookUpUserByEmail, lookupUserById };
