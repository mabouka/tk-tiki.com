import { Role } from '@prisma/client';

export type AuthPayload = {
  userId: string;
  role: Role;
};
