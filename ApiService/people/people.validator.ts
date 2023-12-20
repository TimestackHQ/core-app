import * as Joi from "joi";

export const getPeopleQueryValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            searchQuery: Joi.string().allow("").optional(),
            getConnectedOnly: Joi.string().valid("true").optional()
        });
        return schema.validate(body);
}

export const getMutualsQueryValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        getAll: Joi.boolean().optional()
    });
    return schema.validate(body);

};

