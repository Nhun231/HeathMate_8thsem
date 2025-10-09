import {ForbiddenException, NotFoundException} from "@nestjs/common";

export class IngredientNotFoundError extends NotFoundException{
    constructor(message = 'Cannot load ingredient details') {
        super({
            code: 'Ingredient.NotFound',
            message,
        });
    }
}

export class IngredientForbiddenError extends ForbiddenException {
    constructor(message = 'You do not have permission to access this ingredient') {
        super({
            code: 'Ingredient.Forbidden',
            message,
        });
    }
}