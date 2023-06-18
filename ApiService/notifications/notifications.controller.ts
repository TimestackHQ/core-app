import { NextFunction, Request, Response } from "express";
import { GCP, Models } from "../../shared";
import { NotificationSchema } from "../../shared/models/Notification";
import * as jwt from "jsonwebtoken";
import { v4 } from "uuid";

export async function get(req: Request, res: Response, next: NextFunction) {

    try {

        const skip = req.query.skip ? req.query.skip : 0;

        const notifications = await Models.Notification.find({
            user: req.user._id,
        }).populate([
            {
                path: "data.payload.eventId",
                select: "name _id publicId",
                options: {
                    populate: {
                        path: "cover",
                        select: "thumbnail snapshot",
                    }
                }

            }, {
                path: "data.payload.userId",
                select: "profilePictureSource",
            }
        ]).sort({ createdAt: -1 }).skip(Number(skip)).limit(15);




        res.status(200).json((await Promise.all(notifications.map(async notification => {

            return {
                ...notification.toJSON(),
                // @ts-ignore
                userProfilePicture: notification?.data?.payload?.userId?.profilePictureSource,
                eventCover:
                    // @ts-ignore
                    notification?.data?.payload?.eventId?.cover?.snapshot ?
                        // @ts-ignore
                        await GCP.signedUrl(notification?.data?.payload?.eventId?.cover?.snapshot) :
                        // @ts-ignore
                        notification?.data?.payload?.eventId?.cover?.thumbnail ?
                            // @ts-ignore
                            await GCP.signedUrl(notification?.data?.payload?.eventId?.cover?.thumbnail) :
                            null,
                createdAt: notification.createdAt
            }
        }))).sort((a: any, b: any) => {
            return b.createdAt - a.createdAt;
        }));

    } catch (e) {
        next(e);
    }

}

export async function count(req: Request, res: Response, next: NextFunction) {
    try {
        const count = await Models.Notification.countDocuments({
            user: req.user._id,
            acknowledgedAt: null
        });

        res.status(200).json({ count });
    } catch (e) {
        next(e);
    }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
        const { notificationIds } = req.body;

        const query: any = {
            user: req.user._id,
        };

        if (notificationIds.length > 0) {
            query["_id"] = {
                $in: notificationIds
            }
        }

        await Models.Notification.updateMany(query, {
            $set: {
                acknowledgedAt: new Date()
            }
        });

        res.sendStatus(200);

    } catch (e) {
        next(e);
    }
}
