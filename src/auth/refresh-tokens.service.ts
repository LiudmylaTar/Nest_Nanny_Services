import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from './schemas/refresh-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_MS,
} from './utils/refresh-token.util';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  //   Створює сирий токен, хешує та зберігає його в базі даних, а потім повертає сирий токен
  async create(userId: Types.ObjectId): Promise<string> {
    const token = generateRefreshToken();

    await this.refreshTokenModel.create({
      userId,
      tokenHash: hashRefreshToken(token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return token;
  }
  async findValid(tokenHash: string) {
    return this.refreshTokenModel.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });
  }

  async revoke(tokenHash: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({
      tokenHash,
    });
  }
  async revokeAllForUser(userId: Types.ObjectId): Promise<void> {
    await this.refreshTokenModel.deleteMany({
      userId,
    });
  }
  async rotate(
    rawToken: string,
  ): Promise<{ userId: Types.ObjectId; refreshToken: string }> {
    const tokenHash = hashRefreshToken(rawToken);
    const existing = await this.findValid(tokenHash);

    if (!existing) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.revoke(tokenHash);
    const refreshToken = await this.create(existing.userId);

    return {
      userId: existing.userId,
      refreshToken,
    };
  }
}
