import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";


export const getUploadedMediaValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        greaterThanOrEqual: Joi.date().required(),
    });
    return schema.validate(body);

};

export const deleteMemoriesValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        ids: isObjectIdJoiValidator.required(),
    });
    return schema.validate(body);

}

