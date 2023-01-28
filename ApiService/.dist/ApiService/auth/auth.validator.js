"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidator = exports.confirmLoginValidator = exports.loginValidator = void 0;
const Joi = require("joi");
const shared_1 = require("../../shared");
const loginValidator = (body) => {
    const schema = Joi.object({
        username: (0, shared_1.PhoneNumberValidator)().required(),
    });
    return schema.validate(body);
};
exports.loginValidator = loginValidator;
const confirmLoginValidator = (body) => {
    const schema = Joi.object({
        username: (0, shared_1.PhoneNumberValidator)().required(),
        code: Joi.string().required(),
    });
    return schema.validate(body);
};
exports.confirmLoginValidator = confirmLoginValidator;
const registerValidator = (body) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
    });
    return schema.validate(body);
};
exports.registerValidator = registerValidator;
//# sourceMappingURL=auth.validator.js.map