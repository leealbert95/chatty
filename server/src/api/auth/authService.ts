import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { lookUpUserByEmail } from "../userinfo/userInfoService";
import { User, UserCredentials } from "@/db/userModels";
import { InvalidCredentialsCase } from "@shared/user/login";

const SALT_ROUNDS = 12;

class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

/**
 * Creates a new user account and stores an encrypted password.
 */
const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<User> => {
  const existing = await lookUpUserByEmail(email);
  if (existing !== null) throw new UserAlreadyExistsError(email);

  const userId = `u${uuidv4()}`;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await Promise.all([
    User.create({ userId, name, email, createdAt: new Date() }),
    UserCredentials.create({ userId, password: hashedPassword }),
  ]).then(([newUser]) => newUser);

  return user;
};

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
 * Verifies a user's email and password, returning the user on success.
 */
const authenticateUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const user = await User.findOne({ where: { email } });
  if (user === null)
    throw new InvalidCredentialsError(
      InvalidCredentialsCase.USER_NOT_FOUND,
      `User ${email} not found`,
    );

  const creds = await UserCredentials.findOne({
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
