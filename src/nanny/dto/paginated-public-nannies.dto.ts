import { ApiProperty } from '@nestjs/swagger';
import { PublicNannyDto } from './public-nanny.dto';

export class PaginatedPublicNanniesDto {
  @ApiProperty({ type: [PublicNannyDto] })
  data: PublicNannyDto[];

  @ApiProperty({ example: 28 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 7 })
  totalPages: number;
}
