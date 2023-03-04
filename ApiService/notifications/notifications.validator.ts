import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";

export const editProfileValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        username: Joi.string(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string().email(),
        phoneNumber: PhoneNumberValidator
    });
    return schema.validate(body);

};

export const markAsReadValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            notificationIds: Joi.array().items(isObjectIdJoiValidator).required()
        });
        return schema.validate(body);

}