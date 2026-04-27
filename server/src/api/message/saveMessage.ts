import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/prisma";

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

export { saveMessage, MessageDetails };
