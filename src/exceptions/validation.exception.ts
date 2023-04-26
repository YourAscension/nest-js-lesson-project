import {HttpException, HttpStatus} from "@nestjs/common";

export class ValidationException extends HttpException {
    constructor(validationErrors) {
        super({status: HttpStatus.BAD_REQUEST, validationErrors, message: 'Ошибка валидации'}, HttpStatus.BAD_REQUEST);
    }
}