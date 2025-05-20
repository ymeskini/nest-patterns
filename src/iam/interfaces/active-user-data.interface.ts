import { Role } from '../../users/enums/role.enum';

export interface ActiveUserData {
  /** The user id */
  sub: number;
  /** The user email */
  email: string;
  /** The user role */
  role: Role;
}
