import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { lookUpUserByEmail } from "./userInfoService";
import { prisma } from "@/prisma";
import { InvalidCredentialsCase } from "@shared/user/login";

const SALT_ROUNDS = 12;

/** Thrown when attempting to register an email that already exists. */
class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

/**
 * Error thrown if validation checks fail during user authentication. Not
 * intended to be used for errors due to database read failures.
 */
class InvalidCredentialsError extends Error {
  public readonly invalidCredentialsCase: InvalidCredentialsCase;

  constructor(invalidCredentialsCase: InvalidCredentialsCase, message: string) {
    super(message);
    this.invalidCredentialsCase = invalidCredentialsCase;
  }
}

/**
 * Creates a new user account and stores an encrypted password.
 */
const registerUser = async (name: string, email: string, password: string) => {
  const existing = await lookUpUserByEmail(email);
  if (existing !== null) throw new UserAlreadyExistsError(email);

  const userId = `u${uuidv4()}`;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return await prisma.user.create({
    data: {
      userId,
      name,
      email,
      credentials: {
        create: { password: hashedPassword },
      },
    },
  });
};

/**
 * Verifies a user's email and password, returning the user on success.
 */
const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user === null)
    throw new InvalidCredentialsError(
      InvalidCredentialsCase.USER_NOT_FOUND,
      `User ${email} not found`,
    );

  const creds = await prisma.userCredentials.findFirst({
    where: { userId: user.userId },
  });
  if (creds === null)
    throw new InvalidCredentialsError(
      InvalidCredentialsCase.USER_NOT_FOUND,
      `User ${user.userId} password not found`,
    );

  const match = await bcrypt.compare(password, creds.password);
  if (!match)
    throw new InvalidCredentialsError(
      InvalidCredentialsCase.WRONG_PASSWORD,
      `Wrong password for user ${user.userId}`,
    );

  return user;
};

export {
  authenticateUser,
  InvalidCredentialsError,
  registerUser,
  UserAlreadyExistsError,
};
