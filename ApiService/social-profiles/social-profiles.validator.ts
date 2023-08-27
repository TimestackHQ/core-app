import * as Joi from "joi";

export const getMutuals = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string(),
        location: Joi.string(),
        about: Joi.string(),
        cover: Joi.string(),
        invitees: Joi.array().items(Joi.string()).required(),
        locationMapsPayload: Joi.any(),
        defaultPermission: Joi.string().valid("editor", "viewer"),
    });

    return schema.validate(body);
};
