import { RoomDto, RoomType } from "./room";

/** Request format of /api/room/create */
interface CreateRoomRequest {
  name: string;
  type: RoomType;
}

/** Response format of /api/room/create */
interface CreateRoomResponse {
  room: RoomDto;
}

export { CreateRoomRequest, CreateRoomResponse };
