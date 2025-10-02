import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export class PaginateDto {
    // ---- Offset pagination ----
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    search?: string;

    // ---- Keyset pagination ----
    @IsOptional()
    @IsString()
    cursor?: string; // lastId

    @IsOptional()
    @Type(() => Number)
    lastSortValue?: number;

    // ---- Sorting ----
    @IsOptional()
    @IsString()
    sortBy?: string = '_id';

    @IsOptional()
    @IsEnum(['asc', 'desc'], {
        message: 'sortOrder must be either asc or desc',
    })
    sortOrder?: 'asc' | 'desc' = 'asc';
}
