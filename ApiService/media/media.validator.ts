import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";


export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string().required(),
        location: Joi.string().required(),
        cover: Joi.any(),
        invitees: Joi.array().items(
            Joi.object(
                {
                    _id: isObjectIdJoiValidator,
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                    email: Joi.string().email(),
                    phoneNumber: PhoneNumberValidator,
                }
            )
        ).required(),
    });
    return schema.validate(body);

};

