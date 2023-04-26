import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import {plainToClass} from "class-transformer";
import {validate, ValidationError} from "class-validator";
import {ValidationException} from "../exceptions/validation.exception";

type FormattedValidationErrorType = {
    field: string;
    message: string;
}

@Injectable()
export class ValidationPipe<T> implements PipeTransform<T> {
    async transform<T>(value: T, metadata: ArgumentMetadata): Promise<T | never> {
        const obj: ValidationError[] = plainToClass(metadata.metatype, value)
        const errors: ValidationError[] = await validate(obj)

        if (errors.length) {

            const validationErrors: FormattedValidationErrorType[] = errors.reduce((acc: FormattedValidationErrorType[], validationError: ValidationError) => {
                Object.values(validationError.constraints).forEach(constraint => {
                    const field = validationError.property;
                    const message = constraint;
                    acc.push({field, message})
                })

                return acc
            }, [])

            throw new ValidationException(validationErrors)
        }
        return value;
    }
}