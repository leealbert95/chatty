import { MemberType } from "./member";

/** Request format of /api/room/:roomid/add */
interface AddMemberRequest {
  userId: string;
  memberType: MemberType;
}

/** Response format of /api/room/:roomid/add */
interface AddMemberResponse {
  roomId: string;
  userId: string;
  memberType: MemberType;
}

export { AddMemberRequest, AddMemberResponse };
