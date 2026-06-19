import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { NoWhitespace } from '../decorators/field-validation.decorator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  @NoWhitespace()
  email: string;
}
