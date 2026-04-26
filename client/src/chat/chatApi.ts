import {
  ListMessagesResponse,
  MessageDto,
} from "../../../shared/message/listMessages";
import { ListRoomsResponse, RoomDto } from "../../../shared/room/listRooms";
import { BACKEND_URL } from "../config";
import { Message, Room } from "../types";

const BASE = `${BACKEND_URL}/api/chat`;

const parseError = async (res: Response): Promise<never> => {
  const { error } = (await res.json()) as { error: string };
  throw new Error(error);
};

const roomDtoToRoom = (dto: RoomDto): Room => ({
  id: dto.roomId,
  name: dto.name,
  isRoom: dto.type === "room",
  members: [], // TODO: populate via listUsers when wired up
});

const messageDtoToMessage = (dto: MessageDto): Message => ({
  id: dto.messageId,
  content: dto.content,
  author: dto.sentBy,
  room: dto.roomId,
  timeSent: new Date(dto.sentAt),
});

/**
 * Fetches all rooms the current user belongs to.
 */
const fetchRooms = async (): Promise<Room[]> => {
  const res = await fetch(`${BASE}/rooms`, { credentials: "include" });
  if (!res.ok) return parseError(res);
  const data = (await res.json()) as ListRoomsResponse;
  return data.map(roomDtoToRoom);
};

/**
 * Fetches a page of messages for the given room, ordered oldest first.
 */
const fetchMessages = async (
  roomId: string,
  page = 1,
  pageSize = 50,
): Promise<Message[]> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const res = await fetch(`${BASE}/${roomId}/messages?${params}`, {
    credentials: "include",
  });
  if (!res.ok) return parseError(res);
  const data = (await res.json()) as ListMessagesResponse;
  return data.map(messageDtoToMessage);
};

export { fetchMessages, fetchRooms };
