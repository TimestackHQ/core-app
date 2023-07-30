import { NextFunction, Request, Response } from "express";
import { AWS, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import mongoose from "mongoose";
import { IUser } from "../../shared/models/User";
import { IMedia } from "../../shared/@types/Media";
import { MediaInternetType, SocialProfileInterface } from "../../shared/@types/public";

const getProfile = async (userId: mongoose.Schema.Types.ObjectId/***/, targetUserId: string) => {

    let profile: SocialProfileInterface;
    const profileDocument = await Models.SocialProfile.findOne({
        users: {
            $all: [userId, targetUserId]
        }
    }).select("-media").populate<IUser>({
        path: "users",
        select: "firstName lastName username profilePictureSource"
    });

    const userProfiles = await Models.SocialProfile.find({
        users: {
            $in: [userId],
            $nin: [targetUserId]
        }
    }).select("_id").lean();

    console.log(userProfiles);

    const userProfilesIds = userProfiles.map((profile: any) => profile._id);

    const mutualsProfiles = await Models.SocialProfile.find({
        _id: {
            $in: userProfilesIds
        },
        status: "ACTIVE",
        users: {
            $in: [targetUserId],
            $nin: [userId]
        },
        limit: 3
    }).select("users").populate({
        path: "users",
        select: "firstName lastName username profilePictureSource"
    }).lean();

    const mutualProfilesCount = await Models.SocialProfile.countDocuments({
        _id: {
            $in: userProfilesIds
        },
        status: "ACTIVE",
        users: {
            $in: [targetUserId]
        },
    });

    const mutualsObject = {
        mutualProfilesToDisplay: mutualsProfiles.map((mutual: any) => {
            const mutualUser = mutual.users.filter((user: any) => user._id.toString() !== userId.toString())[0];
            return {
                _id: mutualUser._id,
                firstName: mutualUser.firstName,
                lastName: mutualUser.lastName,
                profilePictureSource: mutualUser.profilePictureSource,
            }
        }),
        mutualProfilesCount
    }


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
            canUnblock: permissions.canUnblock,
            activeSince: profileDocument.createdAt,
            ...mutualsObject
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
            canUnblock: false,
            ...mutualsObject
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

        const profile = await Models.SocialProfile.findOne(profileQuery)
            .select({
                content: 1,
            }).populate({
                path: "content",
                options: {
                    limit: req.query?.limit ? Number(req.query.limit) : 30,
                    skip: req.query?.skip ? Number(req.query.skip) : 0
                }
            });


        if (!profile) {
            return res.sendStatus(404);
        }

        const contentReferences = profile.content;

        const media = await Models.Media.find({
            _id: {
                $in: contentReferences.map((contentReference) => contentReference.contentType === "media")
            }
        });

        const groups = await Models.MediaGroup.find({
            _id: {
                $in: contentReferences.map((contentReference) => contentReference.contentType === "mediaGroup")
            }
        });

        const content = [
            ...media.map(media => ({
                payload: media.toObject(),
                createdAt: media.createdAt,
                type: "media"
            })),
            ...groups.map(group => ({
                payload: group.toObject(),
                createdAt: group.createdAt,
                type: "mediaGroup"
            }))
        ]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())


        const mediaFormatter = async (media: IMedia) => ({
            _id: media._id,
            storageLocation: await media.getFullsizeLocation(),
            thumbnail: await media.getThumbnailLocation(),
            createdAt: media.createdAt,
            hasPermission: media.user.toString() === req.user._id.toString(),
            user: String(media.user),
            timestamp: media.timestamp,
        });

        res.json({
            content: await Promise.all(content.map(async (content) => {
                if (content instanceof Models.Media) {
                    return {
                        _id: content._id,
                        content: {
                            storageLocation: await content.getFullsizeLocation(),
                            thumbnail: await content.getThumbnailLocation(),
                            createdAt: content.createdAt,
                            hasPermission: content.user.toString() === req.user._id.toString(),
                            user: content.user,
                            timestamp: content.timestamp,
                        }
                    }
                } else if (content instanceof Models.MediaGroup) {
                    const media = await Models.Media.findById(content.media[0]);

                    if (!media) return;
                    return {
                        _id: content._id,
                        firstMedia: {
                            storageLocation: await media.getFullsizeLocation(),
                            thumbnail: await media.getThumbnailLocation(),
                            createdAt: media.createdAt,
                            hasPermission: media.user.toString() === req.user._id.toString(),
                            user: media.user,
                            timestamp: media.timestamp,
                        }
                    }
                }
            }))
        });


    } catch (Err) {
        next(Err);
    }
}