import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";


const availabilityValidator = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
})
const availabilitiesValidator = Joi.array().items(availabilityValidator).required();

const contactsValidator = Joi.array().items(
    Joi.string().email()).required()

export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string().required(),
        location: Joi.string().required(),
        contacts: contactsValidator
    });
    return schema.validate(body);

};

