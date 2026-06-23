import { ApiProperty } from '@nestjs/swagger';

export class FavoriteToggleResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the nanny is in favorites after the toggle',
  })
  isFavorite: boolean;
}
