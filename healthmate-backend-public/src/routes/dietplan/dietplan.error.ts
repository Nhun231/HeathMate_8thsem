import { NotFoundException, BadRequestException } from '@nestjs/common';

export class NotFoundUserCalculationException extends NotFoundException {
  constructor(message = 'Không tìm thấy dữ liệu tính toán của người dùng') {
    super({
      code: 'UserCalculation.NotFound',
      message,
    });
  }
}

export class NotFoundDietPlanException extends NotFoundException {
  constructor(message = 'Không tìm thấy kế hoạch ăn kiêng') {
    super({
      code: 'DietPlan.NotFound',
      message,
    });
  }
}

export class InvalidTargetWeightChangeException extends BadRequestException {
  constructor(message = 'Cân nặng mục tiêu không hợp lệ') {
    super({
      code: 'DietPlan.InvalidTargetWeightChange',
      message,
    });
  }
}
