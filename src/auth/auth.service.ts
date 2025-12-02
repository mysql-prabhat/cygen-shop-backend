import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new UnauthorizedException('User already exists');

    return this.users.createUser(email, password);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwt.sign(payload),
    };
  }
  async validateGoogleUser(profile: any) {
    console.log('profile',profile);
    
    const email = profile.email;

    let user = await this.users.findByEmail(email);
    if (!user) {
        user = await this.users.createUser(profile, 'GOOGLE_AUTH'); // random placeholder
    }
console.log('user data -',user);
    return user;
    }
    
    async googleLogin(user: any) {
        return {
            access_token: await this.jwt.sign({ sub: user.id, email: user.email }),
        };
    }
}
