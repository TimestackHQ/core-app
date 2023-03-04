import {NextFunction, Request, Response} from "express";
import {GCP, Models} from "../../shared";
import * as jwt from "jsonwebtoken";
import {v4} from "uuid";

export async function get (req: Request, res: Response, next: NextFunction) {

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
        ]).skip(Number(skip)).limit(10);




        res.status(200).json((await Promise.all(notifications.map(async notification => {
            console.log(JSON.stringify(notification?.data?.payload?.userId))

            return {
                ...notification.toJSON(),
                userProfilePicture: notification?.data?.payload?.userId?.profilePictureSource,
                eventCover:
                    notification?.data?.payload?.eventId?.cover?.snapshot ?
                        await GCP.signedUrl(notification?.data?.payload?.eventId?.cover?.snapshot) :
                        notification?.data?.payload?.eventId?.cover?.thumbnail ?
                            await GCP.signedUrl(notification?.data?.payload?.eventId?.cover?.thumbnail) :
                            null,


                // data: await GCP.get(notification.data)
            }
        }))));

    } catch (e) {
        next(e);
    }

}

export async function markAsRead (req: Request, res: Response, next: NextFunction) {
    try {
        const {notificationIds} = req.body;

        const query: any = {
            user: req.user._id,
        };

        if(notificationIds.length > 0) {
            query["_id"] = {
                $in: notificationIds
            }
        }

        console.log(query)

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
