/** Currently supported room types. */
enum RoomType {
  DM = "dm",
  ROOM = "room",
}

/** Defines the data schema of a room. */
interface RoomDto {
  roomId: string;
  name: string;
  type: RoomType;
  createdAt: string; // ISO 8601 date string
}

export { RoomType, RoomDto };
