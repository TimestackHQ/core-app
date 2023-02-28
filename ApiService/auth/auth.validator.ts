import * as Joi from "joi";
import {PhoneNumberValidator} from "../../shared";

export const loginValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        phoneNumber: PhoneNumberValidator().required(),
    });
    return schema.validate(body);

};

export const confirmLoginValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            username: PhoneNumberValidator().required(),
            code: Joi.string().required(),
        });
        return schema.validate(body);

}

export const registerValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            email: Joi.string(),
            username: Joi.string(),
            birthDate: Joi.date(),

        });
        return schema.validate(body);

}