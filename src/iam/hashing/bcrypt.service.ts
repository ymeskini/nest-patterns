import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(value: string | Buffer): Promise<string> {
    const salt = await genSalt();
    return hash(value, salt);
  }

  async compare(value: string | Buffer, encrypted: string): Promise<boolean> {
    return compare(value, encrypted);
  }
}
