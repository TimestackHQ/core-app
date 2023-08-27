import * as Joi from "joi";

export const getMutualsQueryValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        getAll: Joi.boolean().optional()
    });
    return schema.validate(body);

};

