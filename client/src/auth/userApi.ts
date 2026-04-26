import { LoginRequest, LoginResponse, InvalidCredentialsCase } from '../../../shared/user/login';
import { RegisterRequest, RegisterResponse } from '../../../shared/user/register';
import { User } from '../../../shared/user/user';
import { BACKEND_URL } from '../config';

const BASE = `${BACKEND_URL}/api/user`;

const opts = (method: string, body?: object): RequestInit => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

class InvalidCredentialsError extends Error {
  public readonly reason: InvalidCredentialsCase;

  constructor (reason: InvalidCredentialsCase) {
    super();
    this.reason = reason;
  }
}

class UserAlreadyExistsError extends Error {}

const parseLoginError = async (res: Response): Promise<never> => {
  if (res.status === 401) {
    const { reason } = await res.json() as { reason: string };
    throw new InvalidCredentialsError(reason as InvalidCredentialsCase);
  }
  throw new Error();
};

const parseRegisterError = async (res: Response): Promise<never> => {
  if (res.status === 409) {
    throw new UserAlreadyExistsError();
  }
  throw new Error();
}

/**
 * Authenticates a user by email and password.
 */
const loginUser = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${BASE}/login`, opts('POST', { email, password } satisfies LoginRequest));
  if (!res.ok) return parseLoginError(res);
  return res.json() as Promise<LoginResponse>;
};

/**
 * Registers a new user account.
 */
const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  const res = await fetch(`${BASE}/register`, opts('POST', { name, email, password } satisfies RegisterRequest));
  if (!res.ok) return parseRegisterError(res);
  return res.json() as Promise<RegisterResponse>;
};

/**
 * Ends the current user's session on the server.
 */
const logoutUser = async (): Promise<void> => {
  await fetch(`${BASE}/logout`, opts('POST'));
};

export { loginUser, registerUser, logoutUser, InvalidCredentialsError, UserAlreadyExistsError };
