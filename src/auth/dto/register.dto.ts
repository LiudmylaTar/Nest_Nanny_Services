import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import {
  IsLatinPassword,
  NoWhitespace,
} from '../decorators/field-validation.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'Ada' })
  @IsString()
  @NoWhitespace()
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  @NoWhitespace()
  email: string;

  @ApiProperty({ example: 'secret12', minLength: 6 })
  @IsString()
  @MinLength(6)
  @NoWhitespace()
  @IsLatinPassword()
  password: string;
}
