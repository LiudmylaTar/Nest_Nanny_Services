import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FilterOption } from '../constants/filter-option.enum';

export class GetNanniesQueryDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 4,
    minimum: 1,
    maximum: 50,
    description: 'Number of nannies per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 4;

  @ApiPropertyOptional({
    enum: FilterOption,
    default: FilterOption.ALL,
    description: 'Sort and filter option',
  })
  @IsOptional()
  @IsEnum(FilterOption)
  filter?: FilterOption = FilterOption.ALL;
}
