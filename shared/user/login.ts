import { UserDto } from "./user";

/** POST /api/user/login */
interface LoginRequest {
  email: string;
  password: string;
}

type LoginResponse = UserDto;

enum InvalidCredentialsCase {
  USER_NOT_FOUND = "user_not_found",
  WRONG_PASSWORD = "wrong_password",
}

export { LoginRequest, LoginResponse, InvalidCredentialsCase };
