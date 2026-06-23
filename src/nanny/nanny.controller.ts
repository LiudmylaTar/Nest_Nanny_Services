import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/type/auth-user.type';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoriteNanniesDto } from './dto/favorite-nannies.dto';
import { FavoriteToggleResponseDto } from './dto/favorite-toggle-response.dto';
import { FullNannyDto } from './dto/full-nanny.dto';
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

  @Get('favorites')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get favorite nannies (authenticated users only)' })
  @ApiOkResponse({ type: FavoriteNanniesDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  getFavorites(@CurrentUser() user: AuthUser): Promise<FavoriteNanniesDto> {
    return this.nannyService.getFavorites(user.id.toString());
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get nanny details with reviews (registered users only)',
  })
  @ApiOkResponse({ type: FullNannyDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Nanny not found' })
  getById(@Param('id') id: string): Promise<FullNannyDto> {
    return this.nannyService.getById(id);
  }

  @Patch(':id/favorite')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toggle nanny favorite status (add or remove)',
  })
  @ApiOkResponse({ type: FavoriteToggleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Nanny not found' })
  toggleFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<FavoriteToggleResponseDto> {
    return this.nannyService.toggleFavorite(user.id.toString(), id);
  }
}
