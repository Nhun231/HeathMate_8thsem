import { ForbiddenException, NotFoundException } from "@nestjs/common";

export class DishNotFoundError extends NotFoundException {
    constructor(message = 'Cannot load dish details') {
        super({
            code: 'Dish.NotFound',
            message,
        });
    }
}

export class DishForbiddenError extends ForbiddenException {
    constructor(message = 'You do not have permission to access this dish') {
        super({
            code: 'Dish.Forbidden',
            message,
        });
    }
}
