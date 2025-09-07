import { Role } from '../../../../../generated/prisma';

export interface JwtPayload {
  sub: string;
  role: Role;
}
