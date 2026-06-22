import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FilterOption } from './constants/filter-option.enum';
import { PaginatedPublicNanniesDto } from './dto/paginated-public-nannies.dto';
import { toPublicNannyDto } from './mappers/nanny.mapper';
import { Nanny, NannyDocument } from './schemas/nanny.schema';
import { buildNannyListQuery } from './utils/nanny-query.util';

@Injectable()
export class NannyService {
  constructor(
    @InjectModel(Nanny.name)
    private nannyModel: Model<NannyDocument>,
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
}
