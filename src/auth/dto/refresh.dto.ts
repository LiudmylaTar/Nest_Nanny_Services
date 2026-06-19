import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    example: '9d4c30783a3d25bf2ee62ef37e6cffd113f8f862132b852fd2c56362e26d5a1c',
    description:
      'Optional in Postman if httpOnly cookie refreshToken is already set after login. Body is a fallback for manual testing.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
