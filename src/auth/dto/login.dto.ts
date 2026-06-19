import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import {
  IsLatinPassword,
  NoWhitespace,
} from '../decorators/field-validation.decorator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @NoWhitespace()
  email: string;

  @ApiProperty({ example: 'secret123', format: 'password' })
  @IsString()
  @NoWhitespace()
  @IsLatinPassword()
  password: string;
}
