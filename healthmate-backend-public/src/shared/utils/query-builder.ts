import { Injectable } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { QueryType } from '../schemas/request/request.schema';

@Injectable()
export class QueryBuilderService<T> {
  constructor(
    private readonly model: Model<T>,
    private readonly allowedFilters: string[] = [],
  ) {}

<<<<<<< HEAD
  async query(query: QueryType, allowedFilters?: string[]) {
=======
  async query({
    query,
    allowedFilters,
    populateFields,
  }: {
    query: QueryType;
    allowedFilters?: string[];
    populateFields?: string[];
  }) {
>>>>>>> feat/ingredients
    const { page = 1, limit = 10, sort, ...queryFilters } = query;

    // Filters
    const filtersWhitelist = allowedFilters || this.allowedFilters;

    const conditions: FilterQuery<T> = {};

    Object.entries(queryFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (filtersWhitelist.length > 0 && !filtersWhitelist.includes(key)) {
        return;
      }

      if (typeof value === 'string') {
        // case-insensitive regex
        (conditions as any)[key] = { $regex: value, $options: 'i' };
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        // exact matches on numbers and booleans
        (conditions as any)[key] = value;
      } else if (Array.isArray(value)) {
        // array values, use $in operator
        (conditions as any)[key] = { $in: value };
      }
      // else if (typeof value === 'object') {
      //   // range queries { min: 10, max: 100 } -> { $gte: 10, $lte: 100 }
      //   const rangeQuery: any = {};
      //   if (value.min !== undefined) rangeQuery.$gte = value.min;
      //   if (value.max !== undefined) rangeQuery.$lte = value.max;
      //   if (value.gt !== undefined) rangeQuery.$gt = value.gt;
      //   if (value.lt !== undefined) rangeQuery.$lt = value.lt;

      //   if (Object.keys(rangeQuery).length > 0) {
      //     (conditions as any)[key] = rangeQuery;
      // }}
      else {
        (conditions as any)[key] = value;
      }
    });

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sortObj: Record<string, 1 | -1> = {};
    if (sort) {
      sort.split(',').forEach((field) => {
        if (field.startsWith('-')) {
          sortObj[field.slice(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    }

    const mongooseQuery = this.model
      .find(conditions)
      .skip(skip)
      .limit(limit)
<<<<<<< HEAD
      .sort(sortObj);
=======
      .sort(sortObj)
      .select('-password');

    if (populateFields) {
      mongooseQuery.populate(populateFields);
    }
>>>>>>> feat/ingredients

    const [results, total] = await Promise.all([
      mongooseQuery.exec(),
      this.model.countDocuments(conditions),
    ]);

    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
