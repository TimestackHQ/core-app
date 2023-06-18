import { NextFunction, Request, Response } from "express";
import { GCP, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import { getBuffer, standardEventPopulation } from "./events.tools";
import { ObjectId } from "mongoose";
import moment = require("moment");
import mongoose from "mongoose";
import { UserSchema } from "../../shared/models/User";
import { SocialProfileInterface } from "../../shared/@types/public";

const getProfile = async (userId: mongoose.Types.ObjectId, targetUserId: string) => {

    let profile: SocialProfileInterface;
    const profileDocument = await Models.SocialProfile.findOne({
        users: {
            $all: [userId, targetUserId]
        }
    }).select("-media").populate<UserSchema>({
        path: "users",
        select: "firstName lastName username profilePictureSource"
    }).lean();

    if (profileDocument) {
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
            canAdd: profileDocument.status === "NONE",
            canAccept: profileDocument.status === "PENDING" && profileDocument.addedBy.toString() !== userId.toString(),
            canUnblock: profileDocument.status === "BLOCKED" && profileDocument.blockedBy.toString() === userId.toString()
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