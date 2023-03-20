import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";

export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string(),
        location: Joi.string(),
        about: Joi.string(),
        cover: Joi.string(),
        invitees: Joi.array().items(isObjectIdJoiValidator).required(),
    });

    return schema.validate(body);
};

export const updatePeopleValidator = (body: unknown): Joi.ValidationResult => {
    const schema = Joi.object({
        add: Joi.array().items(isObjectIdJoiValidator).required(),
        remove: Joi.array().items(isObjectIdJoiValidator).required(),
    });

    return schema.validate(body);
}

