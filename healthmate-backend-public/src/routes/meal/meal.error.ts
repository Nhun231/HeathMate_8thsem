export class MealNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MealNotFoundError';
  }
}

export class MealForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MealForbiddenError';
  }
}

export class MealValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MealValidationError';
  }
}
