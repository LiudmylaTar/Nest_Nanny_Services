import { ApiProperty } from '@nestjs/swagger';
import { PublicNannyDto } from './public-nanny.dto';
export class FavoriteNanniesDto {
  @ApiProperty({ type: [PublicNannyDto] })
  data: PublicNannyDto[];
}