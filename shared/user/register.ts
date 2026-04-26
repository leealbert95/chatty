import { UserDto } from "./user";

/** POST /api/user/register */
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

type RegisterResponse = UserDto;

export { RegisterRequest, RegisterResponse };
