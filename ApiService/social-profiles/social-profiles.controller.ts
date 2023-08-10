import { NextFunction, Request, Response } from "express";
import { AWS, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import mongoose from "mongoose";
import moment from "moment";
import { IUser } from "../../shared/models/User";
import { IMedia } from "../../shared/@types/Media";
import { MediaInternetType, SocialProfileInterface } from "../../shared/@types/public";

const getProfile = async (userId: mongoose.Schema.Types.ObjectId/***/, targetUserId: string) => {

    let profile: SocialProfileInterface;
    let profileDocument = await Models.SocialProfile.findOne({
        users: {
            $all: [userId, targetUserId]
        }
    }).select("-media").populate<IUser>({
        path: "users",
        select: {
            firstName: 1,
            lastName: 1,
            username: 1,
            profilePictureSource: 1,
        }
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


    if (!profileDocument) {

        await Models.SocialProfile.create({
            users: [userId, targetUserId],
            status: "NONE",
            addedBy: userId
        });

        profileDocument = await Models.SocialProfile.findOne({
            users: {
                $all: [userId, targetUserId]
            }
        }).select("-media").populate<IUser>({
            path: "users",
            select: {
                firstName: 1,
                lastName: 1,
                username: 1,
                profilePictureSource: 1,
            }
        });

        if (!profileDocument) {
            throw new Error("Profile not found, doesn't make sense");
        }


    }

    const permissions = profileDocument.permissions(userId);
    profile = {
        _id: profileDocument._id.toString(),
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

    return profile;

}

export async function viewProfile(req: Request, res: Response<SocialProfileInterface>) {
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

        if (process.env.NODE_ENV === "development") {
            return res.sendStatus(200);
        }

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

export const mediaList = async (req: Request, res: Response<{ content: MediaInternetType[] }>, next: NextFunction) => {
    try {

        const profile = await Models.SocialProfile.findOne({
            _id: req.params.profileId,
            users: {
                $in: [req.user._id]
            },
            status: {
                $in: ["ACTIVE", "PENDING"]
            }
        })
            .select("content")
            .populate([{
                path: "content",
                options: {
                    limit: 30,
                    skip: req.query?.skip ? Number(req.query.skip) : 0,
                    sort: {
                        createdAt: 1
                    }
                }
            }]);


        if (!profile) {
            return res.sendStatus(404);
        }
        if (profile.content.length === 0) {
            return res.json({
                content: []
            })
        }

        const media = await Models.Media.find({
            _id: {
                $in: profile.content.filter((contentReference) => contentReference.contentType === "media").map((contentReference) => contentReference.contentId)
            }
        });

        const groups = await Models.MediaGroup.find({
            _id: {
                $in: profile.content.filter((contentReference) => contentReference.contentType === "mediaGroup").map((contentReference) => contentReference.contentId)
            }
        });

        const content = [
            ...media.map(media => ({
                payload: media,
                createdAt: media.createdAt,
            })),
            ...groups.map(group => ({
                payload: group,
                createdAt: group.createdAt,
            }))
        ];

        const mediaContent = (await Promise.all(content.map(async (contentHolder): Promise<MediaInternetType> => {
            const content = contentHolder.payload;

            if (content instanceof Models.Media) {
                return {
                    _id: content._id.toString(),
                    fullsize: await content.getFullsizeLocation(),
                    thumbnail: await content.getThumbnailLocation(),
                    createdAt: content.createdAt,
                    hasPermission: content.user.toString() === req.user._id.toString(),
                    user: content.user.toString(),
                    timestamp: content.timestamp,
                    type: content?.type,
                    mediaList: [],
                    isGroup: false,
                    groupLength: 0,
                    isPlaceholder: false,
                    indexInGroup: 0,
                }
            } else if (content instanceof Models.MediaGroup) {
                const media = await Models.Media.findById(content.media[0]);

                if (!media) throw new Error("Media not found");
                return {
                    _id: media._id.toString(),
                    fullsize: await media.getFullsizeLocation(),
                    thumbnail: await media.getThumbnailLocation(),
                    createdAt: media.createdAt,
                    hasPermission: media.user.toString() === req.user._id.toString(),
                    user: media.user.toString(),
                    timestamp: media.timestamp,
                    type: media?.type,
                    isGroup: true,
                    groupLength: content.media.length,
                    mediaList: (content.media as mongoose.Schema.Types.ObjectId[]).map(id => id.toString()),
                    isPlaceholder: false,
                    indexInGroup: 0,
                }
            }
            throw new Error("Unknown content type");
        }))).sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix())

        res.json({
            content: mediaContent
        });


    } catch (Err) {
        console.log(Err);
        next(Err);
    }
}

export const get = async (req: Request, res: Response) => {

    try {

        const SocialProfiles = await Models.SocialProfile.find({
            users: {
                $in: [req.user._id]
            },
            status: {
                $nin: ["BLOCKED", "NONE"]
            }
        }).populate({
            path: "users",
            match: {
                _id: {
                    $ne: req.user._id
                }
            },
            select: {
                firstName: 1,
                lastName: 1,
                username: 1,
                profilePictureSource: 1,
            },
            options: {
                skip: req.query?.skip ? Number(req.query.skip) : 0,
                limit: req.query?.limit ? Number(req.query.limit) : 30
            }
        }).lean();

        return res.json(SocialProfiles);



    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

}