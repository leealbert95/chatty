import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./schemaMongoDb.prisma",
  datasource: {
    url: process.env["DATABASE_URL_MONGODB"],
  },
});
