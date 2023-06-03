import * as Joi from "joi";
import { isObjectIdJoiValidator, PhoneNumberValidator } from "../../shared";

export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string(),
        location: Joi.string(),
        about: Joi.string(),
        cover: Joi.string(),
        invitees: Joi.array().items(isObjectIdJoiValidator).required(),
        locationMapsPayload: Joi.any(),
        defaultPermission: Joi.string().valid("editor", "viewer"),
    });

    return schema.validate(body);
};
export const updateEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string(),
        startsAt: Joi.string(),
        endsAt: Joi.string(),
        location: Joi.string(),
        about: Joi.string(),
        cover: Joi.string(),
        invitees: Joi.array().items(isObjectIdJoiValidator),
        locationMapsPayload: Joi.any(),
        status: Joi.string().valid("public", "private"),
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

export const updatePermissionValidator = (body: unknown): Joi.ValidationResult => {
    const schema = Joi.object({
        permission: Joi.string().valid("editor", "viewer").required()
    });

    return schema.validate(body);
}

