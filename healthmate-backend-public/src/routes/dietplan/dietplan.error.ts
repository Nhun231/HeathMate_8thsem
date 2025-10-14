import {
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException 
} from '@nestjs/common';
import { ZodError } from 'zod';

export class NotFoundUserCalculationException extends NotFoundException {
  constructor() {
    super([
      {
        message: 'UserCalculation.NotFound',
        path: 'calculation',
      },
    ]);
  }
}

export class NotFoundDietPlanException extends NotFoundException {
  constructor() {
    super([
      {
        message: 'DietPlan.NotFound',
        path: 'dietPlan',
      },
    ]);
  }
}

export class InvalidTargetWeightChangeException extends BadRequestException {
  constructor(detail: string = 'Cân nặng mục tiêu không hợp lệ') {
    super([
      {
        message: 'DietPlan.InvalidTargetWeightChange',
        path: 'targetWeightChange',
        detail,
      },
    ]);
  }
}

export class TargetWeightTooLowException extends BadRequestException {
  constructor() {
    super([
      {
        message: 'DietPlan.TargetWeightTooLow',
        path: 'targetWeightChange',
      },
    ]);
  }
}

export class TargetWeightTooHighException extends BadRequestException {
  constructor() {
    super([
      {
        message: 'DietPlan.TargetWeightTooHigh',
        path: 'targetWeightChange',
      },
    ]);
  }
}

export class TargetWeightExcess extends BadRequestException {
  constructor() {
    super([
      {
        message: 'DietPlan.TargetWeightExcess',
        path: 'targetWeightChange',
      },
    ]);
  }
}