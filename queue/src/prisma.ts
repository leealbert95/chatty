import { PrismaClient } from "@database/prisma/mongodb/generated/prisma/mongodb";

const prisma = new PrismaClient();

export { prisma };
