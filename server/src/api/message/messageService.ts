import { prisma } from "@/prisma";
import { MessageDto } from "@shared/message/message";

const DEFAULT_PAGE_SIZE = 50;

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

export { listMessages };
