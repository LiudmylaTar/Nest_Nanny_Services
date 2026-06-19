import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';
import {
  IsLatinPassword,
  NoWhitespace,
} from '../decorators/field-validation.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Token from reset-password link (?token=...)',
  })
  @IsString()
  @NoWhitespace()
  token: string;

  @ApiProperty({ example: 'newSecret12', minLength: 6 })
  @IsString()
  @MinLength(6)
  @NoWhitespace()
  @IsLatinPassword()
  password: string;

  @ApiProperty({ example: 'newSecret12', minLength: 6 })
  @IsString()
  @MinLength(6)
  @NoWhitespace()
  @IsLatinPassword()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
