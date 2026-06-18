import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserData } from './type/createUser.type';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = new this.userModel({
      ...data,
      password: hashedPassword,
    });

    try {
      const savedUser = await user.save();
      return savedUser.toJSON();
    } catch (error) {
      if (error?.code === 11000) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  // Етап 2: зберігаємо хеш токена + час закінчення дії
  async setPasswordResetToken(
    email: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.userModel.findOneAndUpdate(
      { email },
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
      { new: true },
    );
  }

  // Етап 3: атомарно знаходимо юзера за валідним токеном і оновлюємо пароль
  async resetPassword(tokenHash: string, password: string) {
    // 1. Хешуємо новий пароль (як при register)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Один запит до БД:
    //    - шукаємо юзера з таким tokenHash
    //    - перевіряємо, що токен ще не прострочений ($gt: now)
    //    - записуємо новий password
    //    - видаляємо reset-поля ($unset), щоб токен не можна було використати повторно
    return this.userModel.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        password: passwordHash,
        $unset: {
          passwordResetTokenHash: '',
          passwordResetExpiresAt: '',
        },
      },
      { new: true },
    );
  }
}
