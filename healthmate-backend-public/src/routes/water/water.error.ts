import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export const NotFoundUserWaterDataException = new NotFoundException(
    'Error.NotFoundUserWaterData',
);

export const NotFoundWaterHistoryRecordException = new NotFoundException(
    'Error.NotFoundWaterHistoryRecord',
);

export const InvalidWaterAmountException = new UnprocessableEntityException(
    'Error.InvalidWaterAmount',
);

export const WaterHistoryUpdateNotAllowedException = new UnprocessableEntityException(
    'Error.WaterHistoryUpdateNotAllowed',
);

export const WaterHistoryDeleteNotAllowedException = new UnprocessableEntityException(
    'Error.WaterHistoryDeleteNotAllowed',
);
