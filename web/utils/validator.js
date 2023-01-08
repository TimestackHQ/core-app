import Joi from "joi";
import JoiNumber from "joi-phone-number";

export const PhoneNumberValidator = () => Joi.extend(JoiNumber).string().phoneNumber({
	format: 'international'
})