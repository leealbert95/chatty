/** Currently supported member types. */
enum MemberType {
  ADMIN = "admin",
  MEMBER = "member",
}

/** Defines the data schema of a room member. */
interface MemberDto {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly memberType: MemberType;
  readonly joinedAt: string; // ISO 8601 date string
}

export { MemberDto, MemberType };
