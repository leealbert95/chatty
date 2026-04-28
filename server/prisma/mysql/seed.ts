import "dotenv/config";

import bcrypt from "bcrypt";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "../../src/prisma";

const SALT_ROUNDS = 12;
const PLAINTEXT_PASSWORD = "password";

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
  "Iris",
  "Jack",
  "Karen",
  "Liam",
  "Mia",
  "Noah",
  "Olivia",
  "Paul",
  "Quinn",
  "Rachel",
  "Sam",
  "Tina",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
];

interface UserRecord {
  userId: string;
  name: string;
  email: string;
  password: string;
}

const seed = async (): Promise<void> => {
  const hashedPassword = await bcrypt.hash(PLAINTEXT_PASSWORD, SALT_ROUNDS);

  const users: UserRecord[] = FIRST_NAMES.map((firstName, i) => {
    const lastName = LAST_NAMES[i];
    return {
      userId: `u${uuidv4()}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: PLAINTEXT_PASSWORD,
    };
  });

  await prisma.$transaction(
    users.map((user) =>
      prisma.user.create({
        data: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          credentials: {
            create: { password: hashedPassword },
          },
        },
      }),
    ),
  );

  const csvWriter = createObjectCsvWriter({
    path: path.resolve(__dirname, "users.csv"),
    header: [
      { id: "userId", title: "user_id" },
      { id: "name", title: "name" },
      { id: "email", title: "email" },
      { id: "password", title: "password" },
    ],
  });

  await csvWriter.writeRecords(users);

  console.log("Seeded 20 users.");
  console.log("CSV written to prisma/users.csv");
};

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
