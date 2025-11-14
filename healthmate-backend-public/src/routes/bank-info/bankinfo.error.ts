import { ForbiddenException, NotFoundException } from "@nestjs/common";

export class BankInfoNotFoundError extends NotFoundException {
    constructor(message = 'Cannot load bank info') {
        super({ code: 'BankInfo.NotFound', message });
    }
}

export class BankInfoForbiddenError extends ForbiddenException {
    constructor(message = 'You do not have permission to access this bank info') {
        super({ code: 'BankInfo.Forbidden', message });
    }
}
