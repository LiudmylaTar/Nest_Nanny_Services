import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './type/jwt-payload.type';

type UserResponse = {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // інжектимо UsersService
    private readonly jwtService: JwtService, // інжектимо JwtService
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private buildUserResponse(user: UserResponse) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  private signAccessToken(user: UserResponse) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };
    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: this.normalizeEmail(dto.email),
      password: dto.password,
    });
    const accessToken = await this.signAccessToken(user);
    return {
      accessToken,
      user: this.buildUserResponse(user),
    };
  }

  // приклад для наступного кроку (login):
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      this.normalizeEmail(dto.email),
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.signAccessToken(user);
    return {
      accessToken,
      user: this.buildUserResponse(user),
    };
  }
}
