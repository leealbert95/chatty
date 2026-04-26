import { MemberDto } from "./member";

interface ListMembersResponse {
  members: MemberDto[];
  roomId: string;
}

export { ListMembersResponse };
