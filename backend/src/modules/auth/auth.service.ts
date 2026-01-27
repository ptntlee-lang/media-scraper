import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { hashPassword, verifyPassword } from './utils/hash.util';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(email: string, password: string) {
    const { salt, hash } = await hashPassword(password);
    const user = await this.usersService.create(email, hash, salt);
    // strip sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, salt: _s, ...rest } = user as any;
    return rest;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isValid = await verifyPassword(password, user.salt, user.password);
    if (!isValid) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, salt: _s, ...rest } = user as any;
    return rest;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
