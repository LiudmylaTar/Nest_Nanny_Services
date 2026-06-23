import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { FilterOption } from './constants/filter-option.enum';
import { FavoriteNanniesDto } from './dto/favorite-nannies.dto';
import { FavoriteToggleResponseDto } from './dto/favorite-toggle-response.dto';
import { FullNannyDto } from './dto/full-nanny.dto';
import { PaginatedPublicNanniesDto } from './dto/paginated-public-nannies.dto';
import { toFullNannyDto, toPublicNannyDto } from './mappers/nanny.mapper';
import { Nanny, NannyDocument } from './schemas/nanny.schema';
import { buildNannyListQuery } from './utils/nanny-query.util';

@Injectable()
export class NannyService {
  constructor(
    @InjectModel(Nanny.name)
    private nannyModel: Model<NannyDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getAll(
    page = 1,
    filter: FilterOption = FilterOption.ALL,
    limit = 4,
  ): Promise<PaginatedPublicNanniesDto> {
    const skip = (page - 1) * limit;
    const { filterQuery, sortQuery } = buildNannyListQuery(filter);

    const [docs, total] = await Promise.all([
      this.nannyModel
        .find(filterQuery)
        .select('-reviews')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.nannyModel.countDocuments(filterQuery),
    ]);

    return {
      data: docs.map(toPublicNannyDto),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(id: string): Promise<FullNannyDto> {
    await this.assertNannyExists(id);

    const doc = await this.nannyModel.findById(id).lean();
    return toFullNannyDto(doc!);
  }

  async getFavorites(userId: string): Promise<FavoriteNanniesDto> {
    const ids = await this.usersService.getFavoriteNannies(userId);

    if (!ids.length) {
      return { data: [] };
    }

    const docs = await this.nannyModel
      .find({ _id: { $in: ids } })
      .select('-reviews')
      .lean();

    const order = new Map(ids.map((id, index) => [id.toString(), index]));

    docs.sort(
      (a, b) =>
        (order.get(a._id.toString()) ?? 0) -
        (order.get(b._id.toString()) ?? 0),
    );

    return { data: docs.map(toPublicNannyDto) };
  }

  async toggleFavorite(
    userId: string,
    nannyId: string,
  ): Promise<FavoriteToggleResponseDto> {
    await this.assertNannyExists(nannyId);

    const isFavorite = await this.usersService.isFavoriteNanny(
      userId,
      nannyId,
    );

    if (isFavorite) {
      await this.usersService.removeFavoriteNanny(userId, nannyId);
      return { isFavorite: false };
    }

    await this.usersService.addFavoriteNanny(userId, nannyId);
    return { isFavorite: true };
  }

  private async assertNannyExists(nannyId: string): Promise<void> {
    if (!Types.ObjectId.isValid(nannyId)) {
      throw new NotFoundException('Nanny not found');
    }

    const nanny = await this.nannyModel.exists({ _id: nannyId });

    if (!nanny) {
      throw new NotFoundException('Nanny not found');
    }
  }
}
