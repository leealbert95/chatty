import { MessageDto } from "./message";

/** GET /api/chat/:roomId/messages response */
interface ListMessagesResponse {
  messages: MessageDto[];
  nextPage?: number;
}

export { ListMessagesResponse };
