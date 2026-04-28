import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/prisma";
import { MessageDto } from "@shared/message/message";

const DEFAULT_PAGE_SIZE = 50;

interface MessageDetails {
  content: string;
  roomId: string;
  sentBy: string;
  sentAt: string;
}

/** Persists a new message to the database. */
const saveMessage = async (messageDetails: MessageDetails): Promise<void> => {
  const messageId = `m${uuidv4()}`;
  await prisma.message.create({
    data: {
      messageId,
      content: messageDetails.content,
      roomId: messageDetails.roomId,
      sentBy: messageDetails.sentBy,
      sentAt: new Date(messageDetails.sentAt),
    },
  });
};

/**
 * Returns a paginated list of messages for a room, ordered by time sent
 * ascending.
 */
const listMessages = async (
  roomId: string,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<MessageDto[]> => {
  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { sentAt: "asc" },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return messages.map((m) => ({
    messageId: m.messageId,
    content: m.content,
    roomId: m.roomId,
    sentBy: m.sentBy ?? "",
    sentAt: m.sentAt.toISOString(),
  }));
};

export { saveMessage, listMessages, MessageDetails };
