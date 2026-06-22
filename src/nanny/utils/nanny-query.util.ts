import { FilterOption } from '../constants/filter-option.enum';

type NannyFilterQuery = Record<string, unknown>;
type NannySortQuery = Record<string, 1 | -1>;

export const buildNannyListQuery = (
  filter: FilterOption,
): { filterQuery: NannyFilterQuery; sortQuery: NannySortQuery } => {
  switch (filter) {
    case FilterOption.NAME_ASC:
      return { filterQuery: {}, sortQuery: { name: 1 } };

    case FilterOption.NAME_DESC:
      return { filterQuery: {}, sortQuery: { name: -1 } };

    case FilterOption.LESS_THAN_10:
      return {
        filterQuery: { price_per_hour: { $lt: 10 } },
        sortQuery: { price_per_hour: 1 },
      };

    case FilterOption.GREATER_THAN_10:
      return {
        filterQuery: { price_per_hour: { $gte: 10 } },
        sortQuery: { price_per_hour: -1 },
      };

    case FilterOption.POPULAR:
      return { filterQuery: {}, sortQuery: { rating: -1 } };

    case FilterOption.NOT_POPULAR:
      return { filterQuery: {}, sortQuery: { rating: 1 } };

    case FilterOption.ALL:
    default:
      return { filterQuery: {}, sortQuery: { _id: 1 } };
  }
};
