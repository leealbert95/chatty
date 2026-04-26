import { MemberType } from "./member";
import { RoomDto } from "./room";

/** Request format of /api/room/:roomid/join */
interface JoinRoomRequest {
  roomId: string;
  memberType: MemberType;
}

/** Response format of /api/room/:roomid/join */
interface JoinRoomResponse {
  room: RoomDto;
}

export { JoinRoomRequest, JoinRoomResponse };
