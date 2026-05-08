import { Queue } from "bullmq";
import { Socket } from "socket.io";

import { connection } from "@/connection";
import { MessageQueueEvents } from "@shared/queue/messageQueueEvents";
import { MessagePayload } from "@shared/socket/socketData";

/** Registers the sockets for communicating queue job state to socket server. */
const registerMessageSocketHandlers = (socket: Socket) => {
  socket.on(MessageQueueEvents.MESSAGE_QUEUED, async (data: string) => {
    const parsedPayload = parseToMessagePayload(data);
    if (parsedPayload === null) {
      socket.emit(
        MessageQueueEvents.MESSAGE_SAVE_FAIL,
        "Could not parse payload",
      );
      return;
    }

    const queue = new Queue("messages", { connection });
    await queue.add("message", parsedPayload, {
      jobId: parsedPayload.temporaryMessageId,
    });
  });
};

const parseToMessagePayload = (data: string): MessagePayload | null => {
  try {
    return JSON.parse(data) as MessagePayload;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export { registerMessageSocketHandlers };
