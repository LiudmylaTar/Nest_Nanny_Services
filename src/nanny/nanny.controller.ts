import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetNanniesQueryDto } from './dto/get-nannies-query.dto';
import { PaginatedPublicNanniesDto } from './dto/paginated-public-nannies.dto';
import { NannyService } from './nanny.service';

@ApiTags('nannies')
@Controller('nannies')
export class NannyController {
  constructor(private readonly nannyService: NannyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of nannies (public, without reviews)',
  })
  @ApiOkResponse({ type: PaginatedPublicNanniesDto })
  getAll(
    @Query() query: GetNanniesQueryDto,
  ): Promise<PaginatedPublicNanniesDto> {
    return this.nannyService.getAll(
      query.page ?? 1,
      query.filter,
      query.limit ?? 4,
    );
  }
}
