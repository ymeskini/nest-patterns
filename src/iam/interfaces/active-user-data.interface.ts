import { Role } from '../../users/enums/role.enum';
import { PermissionType } from '../authorization/permission.type';

export interface ActiveUserData {
  /** The user id */
  sub: number;
  /** The user email */
  email: string;
  /** The user role */
  role: Role;
  /** The user permissions */
  permissions: PermissionType[];
}
