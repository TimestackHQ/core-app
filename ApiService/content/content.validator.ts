import * as Joi from "joi";
import { MEDIA_FORMAT_OPTIONS, MEDIA_HOLDER_TYPES, MEDIA_QUALITY_OPTIONS } from "../../shared/consts";

export type LinkContent = {
    sourceHolderId: string;
    targetHolderId: string;
    holderType: typeof MEDIA_HOLDER_TYPES[number];
}
export const linkContentValidator = (body: LinkContent): Joi.ValidationResult => {

    const schema = Joi.object<LinkContent>({
        sourceHolderId: Joi.string().required(),
        targetHolderId: Joi.string().required(),
        holderType: Joi.string().valid(...MEDIA_HOLDER_TYPES, "cover").required(),
    });

    return schema.validate(body);

};