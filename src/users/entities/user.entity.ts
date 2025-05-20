import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/role.enum';
import {
  Permission,
  PermissionType,
} from '../../iam/authorization/permission.type';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ enum: Role, default: Role.Regular, type: 'enum' })
  role: Role;

  // NOTE: Having the "permissions" column in combination with the "role"
  // likely does not make sense, two different approaches to authorization. use role or permissions not both.
  // should be a many to many relation with a permission entity
  @Column({ enum: Permission, default: [], type: 'json' })
  permissions: PermissionType[];
}
