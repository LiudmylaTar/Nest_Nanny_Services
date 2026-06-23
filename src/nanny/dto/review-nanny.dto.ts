import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({ example: 'Olga K.' })
  reviewer: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({
    example: 'Anna is wonderful! My kids loved her and she was always punctual.',
  })
  comment: string;
}
