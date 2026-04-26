import { v4 as uuidv4 } from "uuid";

import { Message } from "@/db/messageModels";
import { MessageDto } from "@shared/message/message";

const DEFAULT_PAGE_SIZE = 50;

interface MessageDetails {
  content: string;
  roomId: string;
  sentBy: string;
  sentAt: string;
}

/**
 * Returns a paginated list of messages for a room, ordered by time sent
 * ascending.
 */
const listMessages = async (
  roomId: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<MessageDto[]> => {
  const messages = await Message.findAll({
    where: { roomId },
    order: [["sentAt", "ASC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return messages.map((message) => message.toMessageDto());
};

const saveMessage = async (messageDetails: MessageDetails): Promise<void> => {
  const messageId = `r${uuidv4()}`;
  await Message.create({
    messageId: messageId,
    content: messageDetails.content,
    roomId: messageDetails.roomId,
    sentBy: messageDetails.sentBy,
    sentAt: new Date(messageDetails.sentAt),
  });
};

export { listMessages, saveMessage, MessageDetails };
