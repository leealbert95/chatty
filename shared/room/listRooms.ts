import { MemberType } from "./member";
import { RoomDto } from "./room";

interface RoomWithMembershipDto extends RoomDto {
  readonly memberType: MemberType;
}

/** GET /api/chat/rooms */
interface ListRoomsResponse {
  readonly rooms: RoomWithMembershipDto[];
  readonly userId: string;
}

export { ListRoomsResponse, RoomWithMembershipDto };
