import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";


const availabilityValidator = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
})
const availabilitiesValidator = Joi.array().items(availabilityValidator).required();

const contactsValidator = Joi.array().items(
    Joi.object({
        anchor: Joi.alternatives(
            Joi.string().email(),
            PhoneNumberValidator()
        ).required(),
    })
).required()

export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        availabilities: availabilitiesValidator,
        contacts: contactsValidator,

    });
    return schema.validate(body);

};

export const respondValidator = (body: unknown): Joi.ValidationResult => {

        const schema = Joi.object({
            newAvailabilities: availabilitiesValidator,
            selectedAvailabilities: Joi.array().items(isObjectIdJoiValidator()).required(),
            contacts: contactsValidator,
        });
        return schema.validate(body);

}

export const confirmValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        start: Joi.date().required(),
        end: Joi.date().required(),
    });
    return schema.validate(body);

}

