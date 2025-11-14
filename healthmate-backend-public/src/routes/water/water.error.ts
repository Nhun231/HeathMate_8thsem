import {
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Không tìm thấy dữ liệu nước theo user + date
 */
export const NotFoundUserWaterDataException = new NotFoundException(
  'Error.NotFoundUserWaterData',
);

/**
 * Không tìm thấy bản ghi lịch sử nước (history item)
 */
export const NotFoundWaterHistoryRecordException = new NotFoundException(
  'Error.NotFoundWaterHistoryRecord',
);

/**
 * Lượng nước không hợp lệ (ví dụ: âm, vượt giới hạn)
 */
export const InvalidWaterAmountException = new UnprocessableEntityException(
  'Error.InvalidWaterAmount',
);

/**
 * Không được phép chỉnh sửa bản ghi (ví dụ: quá ngày)
 */
export const WaterHistoryUpdateNotAllowedException =
  new UnprocessableEntityException('Error.WaterHistoryUpdateNotAllowed');

/**
 * Không được phép xóa bản ghi (ví dụ: quá 7 ngày)
 */
export const WaterHistoryDeleteNotAllowedException =
  new ForbiddenException('Error.WaterHistoryDeleteNotAllowed');

/**
 * Ngày của bản ghi uống nước không hợp lệ (ví dụ: format sai hoặc tương lai)
 */
export const InvalidWaterDateException = new BadRequestException(
  'Error.InvalidWaterDate',
);

/**
 * Không thể thêm bản ghi vì chưa có dữ liệu waterData (business logic)
 */
export const WaterDataMissingForAddRecordException = new BadRequestException(
  'Error.WaterDataMissingForAddRecord',
);
/**
 * Vượt quá giới hạn tổng lượng nước trong ngày (ví dụ: > 10000ml)
 */
export const ExceedDailyWaterLimitException = new UnprocessableEntityException(
  'Error.ExceedDailyWaterLimit',
);
