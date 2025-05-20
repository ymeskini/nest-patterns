import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  uuid: string;

  @ManyToOne(() => User, (user) => user.apiKeys)
  user: Relation<User>;

  // could use scope with a Many-to-Many relationship between API Keys and Scopes. With the scopes feature, users
  // could selectively grant specific permissions/scopes to given API Keys. For example, some
  // API Keys could only let 3-rd party applications "Read" data, but not modify it, etc.
  // @Column()
  // scopes: Scope[];
}
