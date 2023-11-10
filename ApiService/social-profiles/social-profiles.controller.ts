import { NextFunction, Request, Response } from "express";
import { AWS, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import mongoose from "mongoose";
import moment from "moment";
import User, { IUser } from "../../shared/models/User";
import { IMedia } from "../../shared/@types/Media";
import { MediaInternetType, SocialProfileInterface } from "../../shared/@types/public";
import { PeopleSearchResult } from "../people/people.controller";

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

    const userProfilesIds = userProfiles.map((profile: any) => profile._id);

    if (!profileDocument) {

        await Models.SocialProfile.create({
            users: [userId, targetUserId],
            status: "NONE"
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
    }

    return profile;

}

const clearProfile = async (profile: SocialProfileInterface) => {

    if (profile.status !== "PENDING") return false;
    const profileDocument = await Models.SocialProfile.findOne({
        _id: profile._id
    }).select({
        content: 1
    });

    if (!profileDocument) return false;

    const allContent = profileDocument.content;

    for await (const contentId of allContent) {
        const content = await Models.Content.findOne({
            _id: contentId
        });

        if (!content) continue;

        if (content.contentType === "mediaGroup") {
            const mediaGroup = await Models.MediaGroup.findOne({
                _id: content.contentId
            }).select({
                media: 1
            }).populate<IMedia>({
                path: "media",
                select: {
                    files: 1
                }
            });

            if (!mediaGroup) continue;

            for await (const mediaRaw of mediaGroup.media) {

                const media = mediaRaw as IMedia;
                await Promise.allSettled(media.files.map(async (file) => {
                    await AWS.deleteFile(file.storage.path);
                }));
                await Models.Media.deleteOne({
                    _id: media._id
                });

            }
        } else if (content.contentType === "media") {
            const media = await Models.Media.findOne({
                _id: content.contentId
            }).select({
                files: 1
            });

            if (!media) continue;

            await Promise.allSettled(media.files.map(async (file) => {
                await AWS.deleteFile(file.storage.path);
            }));
            await Models.Media.deleteOne({
                _id: media._id
            });
        }

        await Models.SocialProfile.updateOne({
            _id: profile._id
        }, {
            $pull: {
                content: content._id
            }
        });

        await Models.Content.deleteOne({
            _id: content._id
        });
    }

    return true;

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

export async function declineProfile(req: Request, res: Response) {
    try {

        const userId = req.user._id;
        const targetUserId = req.params.userId;

        if (!isObjectIdOrHexString(targetUserId)) {
            return res.sendStatus(400);
        }

        const profile = await getProfile(userId, targetUserId);
        if (profile.status !== "PENDING") {
            return res.sendStatus(400);
        }

        if (!profile._id) {
            return res.sendStatus(400);
        }

        await clearProfile(profile);

        await Models.SocialProfile.updateOne({ _id: profile._id }, {
            status: "NONE",
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
                        timestamp: 1
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

        const contentDetails = [
            ...media.map(media => ({
                payload: media,
                createdAt: media.createdAt,
            })),
            ...groups.map(group => ({
                payload: group,
                createdAt: group.createdAt,
            }))
        ];

        const mediaContent = (await Promise.all(contentDetails.map(async (contentHolderRaw): Promise<MediaInternetType> => {
            const contentDetails = contentHolderRaw.payload;

            let response: MediaInternetType | null = null;

            if (contentDetails instanceof Models.Media) {
                response = {
                    _id: contentDetails._id.toString(),
                    contentId: profile.content.find((contentReference) => contentReference.contentId.toString() === contentDetails._id.toString())?._id.toString(),
                    fullsize: await contentDetails.getFullsizeLocation(),
                    thumbnail: await contentDetails.getThumbnailLocation(),
                    createdAt: contentDetails.createdAt,
                    hasPermission: contentDetails.user.toString() === req.user._id.toString(),
                    user: contentDetails.user.toString(),
                    timestamp: contentDetails.timestamp,
                    type: contentDetails?.type,
                    mediaList: [],
                    isGroup: false,
                    groupLength: 0,
                    isPlaceholder: false,
                    indexInGroup: 0,
                    isProcessing: false,
                }
            } else if (contentDetails instanceof Models.MediaGroup) {
                const media = await Models.Media.findById(contentDetails.media[0]);

                if (!media) throw new Error("Media not found");
                response = {
                    _id: media._id.toString(),
                    contentId: profile.content.find((contentReference) => contentReference.contentId.toString() === media._id.toString())?._id.toString(),
                    fullsize: await media.getFullsizeLocation(),
                    thumbnail: await media.getThumbnailLocation(),
                    createdAt: media.createdAt,
                    hasPermission: media.user.toString() === req.user._id.toString(),
                    user: media.user.toString(),
                    timestamp: media.timestamp,
                    type: media?.type,
                    isGroup: true,
                    groupLength: contentDetails.media.length,
                    mediaList: (contentDetails.media as mongoose.Schema.Types.ObjectId[]).map(id => id.toString()),
                    isPlaceholder: false,
                    indexInGroup: 0,
                    isProcessing: false,
                }
            }

            if (!response) throw new Error("Response is undefined");

            return {
                ...response,
                isProcessing: response?.thumbnail?.path === response?.fullsize?.path,
            }
        }))).sort((a, b) => moment(b.timestamp).unix() - moment(a.timestamp).unix())

        res.json({
            content: mediaContent
        });


    } catch (Err) {
        console.log(Err);
        next(Err);
    }
}

export const get = async (req: Request, res: Response<PeopleSearchResult>) => {

    try {

        const SocialProfiles = await Models.SocialProfile.find({
            users: {
                $in: [req.user._id]
            },
            status: {
                $nin: ["BLOCKED", "NONE"]
            }
        }).populate<IUser>({
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
                limit: req.query?.limit ? Number(req.query.limit) : 30,
                sort: {
                    updatedAt: -1
                }
            }
        }).lean();


        return res.json({
            people: SocialProfiles.map(profile => {
                const user: IUser = profile.users[0] as IUser;

                return {
                    _id: user._id.toString(),
                    profileId: profile._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    profilePictureSource: user.profilePictureSource,
                }
            })
        });



    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

}

