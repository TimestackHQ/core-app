import { NextFunction, Request, Response } from "express";
import { GCP, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import { getBuffer, standardEventPopulation } from "./events.tools";
import { ObjectId } from "mongoose";
import moment = require("moment");
import mongoose from "mongoose";
import { UserSchema } from "../../shared/models/User";
import { MediaInternetType, SocialProfileInterface } from "../../shared/@types/public";
import { MediaGroupType, MediaType } from "../../shared/@types/Media";

const getProfile = async (userId: mongoose.Schema.Types.ObjectId, targetUserId: string) => {

    let profile: SocialProfileInterface;
    const profileDocument = await Models.SocialProfile.findOne({
        users: {
            $all: [userId, targetUserId]
        }
    }).select("-media").populate<UserSchema>({
        path: "users",
        select: "firstName lastName username profilePictureSource",
    });

    if (profileDocument) {

        const permissions = profileDocument.permissions(userId);
        profile = {
            _id: profileDocument._id,
            users: profileDocument.users
                .filter((user: any) => userId.toString() === targetUserId.toString() || user._id.toString() !== userId.toString())
                .map((user: any) => {
                    return {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePictureSource: user.profilePictureSource,
                        username: user.username
                    }
                }
                ),
            status: profileDocument.status,
            canAdd: permissions.canAdd,
            canAccept: permissions.canAccept,
            canUnblock: permissions.canUnblock

        }

    } else {
        const users = await Models.User.find({
            _id: {
                $in: [userId, targetUserId]
            }
        }).select("firstName lastName username profilePictureSource").lean();

        profile = {
            _id: null,
            users: users.filter((user: any) => userId.toString() === targetUserId.toString() || user._id.toString() !== userId.toString()).map((user: any) => {
                return {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePictureSource: user.profilePictureSource,
                    username: user.username
                }
            }),
            status: "NONE",
            canAdd: true,
            canAccept: false,
            canUnblock: false
        }
    }

    return profile;

}

export async function viewProfile(req: Request, res: Response) {
    try {

        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (!isObjectIdOrHexString(targetUserId)) {
            return res.sendStatus(400);
        }

        const profile = await getProfile(userId, targetUserId);

        return res.json(profile);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function addProfile(req: Request, res: Response) {
    try {

        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (!isObjectIdOrHexString(targetUserId)) {
            return res.sendStatus(400);
        }

        const profile = await getProfile(userId, targetUserId);

        if (!profile.canAdd) {
            return res.sendStatus(400);
        }

        if (profile._id) {
            await Models.SocialProfile.updateOne({ _id: profile._id }, {
                status: "PENDING",
                addedBy: userId
            });
        } else {
            await Models.SocialProfile.create({
                users: [userId, targetUserId],
                status: "PENDING",
                addedBy: userId
            });
        }

        res.sendStatus(200);

        console.log({
            type: "connectionRequest",
            payload: {
                profilseId: profile._id,
            }
        })
        const notification = new Models.Notification({
            user: targetUserId,
            title: req.user?.firstName + " " + req.user?.lastName,
            body: "added you",
            data: {
                type: "connectionRequest",
                payload: {
                    userId: targetUserId,
                }
            }
        });

        await notification.save();
        await notification.notify();


    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

}

export async function acceptProfile(req: Request, res: Response) {
    try {

        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (!isObjectIdOrHexString(targetUserId)) {
            return res.sendStatus(400);
        }

        const profile = await getProfile(userId, targetUserId);

        if (!profile.canAccept || !profile._id) {
            return res.sendStatus(400);
        }

        await Models.SocialProfile.updateOne({ _id: profile._id }, {
            status: "ACTIVE",
        });

        return res.sendStatus(200);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

}

export async function hasAccess(req: Request, res: Response) {
    try {

        const profilesCount = await Models.SocialProfile.countDocuments({
            users: {
                $in: [req.user._id]
            },
        });

        if (profilesCount > 0 || process.env?.NODE_ENV === "development") {
            return res.sendStatus(200);
        }

        return res.sendStatus(400);

    } catch (Err) {
        console.log(Err);
        return res.sendStatus(500);
    }
}

export const mediaList = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const profileQuery = {
            _id: isObjectIdOrHexString(req.params.profileId) ? req.params.profileId : null,
            users: {
                $in: [req.user._id]
            }
        }
        const mediaPopulation = {
            path: "media",
            select: "_id publicId storageLocation snapshot thumbnail createdAt user type timestamp",
            match: {
                user: req.query.me ? req.user._id : {
                    $exists: true
                }
            },
        }

        const profile = await Models.SocialProfile.findOne(profileQuery)
            .select({
                media: 1,
            }).populate({
                ...mediaPopulation,
                options: {
                    sort: {
                        timestamp: -1
                    },
                    limit: req.query?.limit ? Number(req.query.limit) : 30,
                    skip: req.query?.skip ? Number(req.query.skip) : 0
                }
            });

        if (!profile) {
            return res.sendStatus(404);
        }

        const profileWithGroups = profile.media.length !== 0 ? await Models.SocialProfile.findOne(profileQuery)
            .select({
                groups: 1,
            }).populate({
                path: "groups",
                match: {
                    timestamp: Number(req.query?.skip) === 0 ? {
                        $lte: profile?.media[0]?.timestamp,
                        $gte: profile?.media[profile?.media.length - 1]?.timestamp
                    } : {
                        $lte: profile?.media[0]?.timestamp,
                        $gt: profile?.media[profile?.media.length - 1]?.timestamp
                    }
                },
                populate: {
                    path: "media",
                    select: "_id publicId storageLocation snapshot thumbnail createdAt user type timestamp",
                    match: {
                        user: req.query.me ? req.user._id : {
                            $exists: true
                        }
                    },
                    options: {
                        // sort: {
                        //     _id: 1
                        // },
                    }
                }
            }) : [];

        console.log(JSON.stringify(profileWithGroups, null, 2))


        if (!profile) {
            return res.sendStatus(404);
        }

        const mediaFormatter = async (media: MediaType) => ({
            _id: media._id,
            publicId: media.publicId,
            storageLocation: media.storageLocation ? await GCP.signedUrl(media.storageLocation) : undefined,
            snapshot: media.snapshot ? await GCP.signedUrl(media.snapshot) : undefined,
            thumbnail: media.thumbnail ? await GCP.signedUrl(media.thumbnail) : undefined,
            createdAt: media.createdAt,
            type: media.type.split("/")[0],
            hasPermission: media.user.toString() === req.user._id.toString(),
            user: String(media.user),
            timestamp: media.timestamp,
        })

        res.json({
            media: [
                ...(
                    await Promise.all(profile.media ? profile.media.map(async (media: MediaType) => {
                        if (media instanceof mongoose.Schema.Types.ObjectId) throw new Error("media is not populated");
                        const mediaResponse: MediaInternetType = {
                            ...(await mediaFormatter(media)),
                            isGroup: false,

                        }
                        return mediaResponse;
                    }
                    ) : [])
                ),
                ...(
                    // @ts-ignore
                    await Promise.all(profileWithGroups?.groups ? profileWithGroups?.groups?.filter(group => group.media[0]).map(async (group: MediaGroupType) => {
                        const media = group.media[0];
                        if (media instanceof mongoose.Schema.Types.ObjectId) throw new Error("media is not populated");
                        const mediaResponse = {
                            ...(await mediaFormatter(media)),
                            isGroup: true,
                            group: group.name,
                            groupMedia: (await Promise.all(group.media.map(async (media: mongoose.Schema.Types.ObjectId | MediaType) => {
                                if (media instanceof mongoose.Schema.Types.ObjectId) throw new Error("media is not populated");
                                return {
                                    ...(await mediaFormatter(media)),
                                }
                            }))).sort((a, b) => {
                                return moment(b.timestamp).unix() - moment(a.timestamp).unix();
                            })
                        }
                        return mediaResponse;
                    }
                    ) : [])
                )
            ].sort((a, b) => {
                return moment(b.timestamp).unix() - moment(a.timestamp).unix();
            })
        });


    } catch (Err) {
        next(Err);
    }
}