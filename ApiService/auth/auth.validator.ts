import * as Joi from "joi";
import {PhoneNumberValidator} from "../../shared";

export const loginValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        phoneNumber: PhoneNumberValidator().allow(""),
        emailAddress: Joi.string().email().allow(""),
    });
    return schema.validate(body);

};

export const confirmLoginValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            username: Joi.string().required(),
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
            eventId: Joi.string(),

        });
        return schema.validate(body);

}

export const notificationLinkValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        pushToken: Joi.string().required(),
    });
    return schema.validate(body);
}