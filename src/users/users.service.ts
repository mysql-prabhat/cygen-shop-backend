import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(profile: any, password: string) {
    const hash = await bcrypt.hash(password, 10);
console.log('createUser profile-',profile);

    return this.prisma.user.create({
      data: { email:profile.email,name:profile.name, password: hash },
    });
  }
}
