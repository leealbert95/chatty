import { PrismaClient } from "@database/prisma/mysql/generated/prisma/mysql";

const prisma = new PrismaClient();

export { prisma };
