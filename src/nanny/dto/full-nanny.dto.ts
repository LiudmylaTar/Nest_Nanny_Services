import { ApiProperty } from '@nestjs/swagger';
import { PublicNannyDto } from './public-nanny.dto';
import { ReviewDto } from './review-nanny.dto';

export class FullNannyDto extends PublicNannyDto {
  @ApiProperty({ type: [ReviewDto] })
  reviews: ReviewDto[];
}
