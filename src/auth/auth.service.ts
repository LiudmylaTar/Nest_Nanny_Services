import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './type/jwt-payload.type';
import { AuthUser } from './type/auth-user.type';
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from './utils/password-reset.util';
import { hashRefreshToken } from './utils/refresh-token.util';

type UserResponse = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

const FORGOT_PASSWORD_RESPONSE = {
  message: 'If email exists, reset link was sent',
};

const RESET_PASSWORD_SUCCESS_RESPONSE = {
  message: 'Password has been reset successfully',
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly refreshTokensService: RefreshTokensService,
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

  private async issueAuthResponse(user: UserResponse) {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.refreshTokensService.create(user._id);

    return this.buildTokenPair(user, refreshToken, accessToken);
  }

  private async buildTokenPair(
    user: UserResponse,
    refreshToken: string,
    accessToken?: string,
  ) {
    return {
      accessToken: accessToken ?? (await this.signAccessToken(user)),
      refreshToken,
      user: this.buildUserResponse(user),
    };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: this.normalizeEmail(dto.email),
      password: dto.password,
    });
    return this.issueAuthResponse(user);
  }

  getMe(user: AuthUser) {
    return {
      user: this.buildUserResponse({
        _id: user.id,
        name: user.name,
        email: user.email,
      }),
    };
  }

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
    return this.issueAuthResponse(user);
  }

  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    const user = await this.usersService.setPasswordResetToken(
      normalizedEmail,
      tokenHash,
      expiresAt,
    );

    if (!user) {
      return FORGOT_PASSWORD_RESPONSE;
    }

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return FORGOT_PASSWORD_RESPONSE;
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Перевірка 1: паролі збігаються
    // (дублює DTO @Match — залишаємо як додатковий захист у сервісі)
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Перевірка 2: той самий sha256, що й у forgotPassword
    // сирий token з листа → hash → шукаємо в БД
    const tokenHash = hashPasswordResetToken(dto.token);

    // Перевірка 3 + оновлення пароля — делегуємо UsersService
    // якщо токен невалідний / прострочений → поверне null
    const user = await this.usersService.resetPassword(
      tokenHash,
      dto.password,
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.refreshTokensService.revokeAllForUser(user._id);

    return RESET_PASSWORD_SUCCESS_RESPONSE;
  }

  async refresh(refreshToken: string) {
    const { userId, refreshToken: newRefreshToken } =
      await this.refreshTokensService.rotate(refreshToken);

    const user = await this.usersService.findById(userId.toString());
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildTokenPair(user, newRefreshToken);
  }

  async logout(refreshToken: string) {
    await this.refreshTokensService.revoke(hashRefreshToken(refreshToken));

    return { message: 'Logged out successfully' };
  }
}
