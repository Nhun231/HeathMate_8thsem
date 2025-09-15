import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
const saltRounds = 10;
@Injectable()
export class HashingService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
