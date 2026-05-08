import { Worker, Job } from "bullmq";
import type { Server } from "socket.io";

import { connection } from "@/connection";
import { prisma } from "@/prisma";

class MessageWorkers {
  constructor(private io: Server) {}

  public createWorker() {
    return new Worker("messages", this.processJob, { connection });
  }

  private processJob = async (job: Job) => {
    const payload = job.data;

    // TODO: Implement DB save here.
  };
}

export { MessageWorkers };
