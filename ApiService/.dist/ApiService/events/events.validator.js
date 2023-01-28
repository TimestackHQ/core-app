"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmValidator = exports.respondValidator = exports.createEventValidator = void 0;
const Joi = require("joi");
const shared_1 = require("../../shared");
const availabilityValidator = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required(),
});
const availabilitiesValidator = Joi.array().items(availabilityValidator).required();
const contactsValidator = Joi.array().items(Joi.object({
    anchor: Joi.alternatives(Joi.string().email(), (0, shared_1.PhoneNumberValidator)()).required(),
})).required();
const createEventValidator = (body) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        availabilities: availabilitiesValidator,
        contacts: contactsValidator,
    });
    return schema.validate(body);
};
exports.createEventValidator = createEventValidator;
const respondValidator = (body) => {
    const schema = Joi.object({
        newAvailabilities: availabilitiesValidator,
        selectedAvailabilities: Joi.array().items((0, shared_1.isObjectIdJoiValidator)()).required(),
        contacts: contactsValidator,
    });
    return schema.validate(body);
};
exports.respondValidator = respondValidator;
const confirmValidator = (body) => {
    const schema = Joi.object({
        start: Joi.date().required(),
        end: Joi.date().required(),
    });
    return schema.validate(body);
};
exports.confirmValidator = confirmValidator;
//# sourceMappingURL=events.validator.js.map