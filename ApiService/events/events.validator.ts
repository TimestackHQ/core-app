import * as Joi from "joi";
import {isObjectIdJoiValidator, PhoneNumberValidator} from "../../shared";


const availabilityValidator = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
})
const availabilitiesValidator = Joi.array().items(availabilityValidator).required();

const contactsValidator = Joi.array().items(
    Joi.string().email()).required();

const inviteeValidator = Joi.object(
    {
        _id: isObjectIdJoiValidator,
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string().email(),
        username: Joi.string(),
        profilePictureSource: Joi.string(),
        phoneNumber: PhoneNumberValidator,
    }
)

export const createEventValidator = (body: unknown): Joi.ValidationResult => {

    const schema = Joi.object({
        name: Joi.string().required(),
        startsAt: Joi.string().required(),
        endsAt: Joi.string().required(),
        location: Joi.string().required(),
        cover: Joi.string(),
        invitees: Joi.array().items(inviteeValidator).required(),
    });
    const v= schema.validate(body);
    console.log(v);

    return v;

};

export const updatePeopleValidator = (body: unknown): Joi.ValidationResult => {
    const schema = Joi.object({
        addedPeople: Joi.array().items(inviteeValidator).required(),
        removedPeople: Joi.array().items(inviteeValidator).required(),
    });

    return schema.validate(body);
}

