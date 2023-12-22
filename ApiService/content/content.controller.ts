import { NextFunction, Request, Response } from "express";
import { Models } from "../../shared";
import {LinkContent} from "./content.validator";


export async function linkContent(req: Request<{ contentId: string }, any, LinkContent>, res: Response, next: NextFunction) {

    try {


        const sourceHolder = req.body.holderType === "event" ? await Models.Event.findOne({
            _id: req.body.sourceHolderId,
        }) : req.body.holderType === "socialProfile" ? await Models.SocialProfile.findOne({
            _id: req.body.sourceHolderId,
        }) : null;

        if(!sourceHolder) {
            return res.status(404).send({
                message: "Not found"
            });
        }

        // if(!sourceHolder.permissions(req.user._id).canLinkNestedPhoto) return res.sendStatus(400);

        const content = await Models.Content.findOne(req.body.holderType === "event" ? {
            _id: req.params.contentId,
            events: {
                $in: [sourceHolder._id]
            }
        } : {
            _id: req.params.contentId,
            socialProfiles: {
                $in: [sourceHolder._id]
            }
        });

        if(!content) return res.sendStatus(404);

        const targetHolder = req.body.holderType === "event" ? await Models.Event.findOne({
            _id: req.body.targetHolderId,
        }) : req.body.holderType === "socialProfile" ? await Models.SocialProfile.findOne({
            _id: req.body.targetHolderId,
        }) : null;

        if(!targetHolder) return res.sendStatus(404);

        targetHolder.content.push(content);

        if(req.body.holderType === "event") {
            await Models.Content.updateOne({
                _id: content._id
            }, {
                $push: {
                    events: targetHolder._id
                }
            });
        }
        else if (req.body.holderType === "socialProfile") {
            await Models.Content.updateOne({
                _id: content._id
            }, {
                $push: {
                    socialProfiles: targetHolder._id
                }
            });
        }

        await targetHolder.save();

        return res.sendStatus(200);

    } catch (e) {
        next(e);
    }

}
