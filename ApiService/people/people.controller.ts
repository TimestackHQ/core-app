import { NextFunction, Request, Response } from "express";
import { Logger, Models } from "../../shared";
import { IUser } from "../../shared/models/User";
import {  } from "../../shared/models/SocialProfile";
import { isObjectIdOrHexString } from "../../shared";
import moment = require("moment");
import * as _ from "lodash";
import { PersonType } from "../@types";
import mongoose from "mongoose";
import { SocialProfileInterface } from "../../shared/@types/SocialProfile";

export type PeopleSearchResult = {
    people: PersonType[]
}

export async function findPeople(req: Request, res: Response<PeopleSearchResult>, next: NextFunction) {

    try {

        let people: IUser[] = [];
        const profiles = await Models.SocialProfile.find({
            users: {
                $in: [req.user._id],
            },
            // status: {
            //     $nin: ["BLOCKED", "NONE"]
            // }
        }).select("users");

        if(String(req.query.getConnectedOnly) === "true") {

            const userIds = profiles.map(profile => profile.users).flat();


            const query: {
                [key: string]: any
            } = {
                _id: {
                    $in: userIds
                }
            }

            if(req.query.searchQuery && String(req.query.searchQuery).length > 4) {
                query["$text"] = {
                    $search: String(req.query.searchQuery)
                }
            }

            people = await Models.User.find(query).limit(50).lean();
        } else {
             people = await Models.User.find({
                $text: {$search: String(req.query.searchQuery)},
            }).limit(10).lean();

        }


        res.json({
            people: people.filter(people => people?.username !== req.user.username).map((person) => ({
                _id: person._id.toString(),
                firstName: person.firstName,
                lastName: person.lastName,
                username: person.username,
                profilePictureSource: person.profilePictureSource,
                profileId: profiles.find(profile => profile.users.includes(person._id))?.id
            }))
        });


    } catch (e) {
        next(e);
    }

}

export async function future(req: Request, res: Response, next: NextFunction) {

    try {

        const eventsCount = await Models.Event.countDocuments({
            users: {
                $in: [req.user._id]
            }
        });
        const events = await Models.Event.find({
            users: {
                $in: [req.user._id]
            }
        })
            .populate({
                path: "users",
                select: "firstName lastName username profilePictureSource",
                match: {
                    _id: {
                        $ne: req.user._id
                    }
                },
                options: {
                    limit: 10
                }
            })
            .limit(50)
            .sort({ createdAt: -1 });

        const people = {};

        events.forEach(event => {
            event.users.forEach(user => {
                // @ts-ignore
                if (people[String(user._id.toString())] === undefined) {
                    // @ts-ignore
                    people[user._id.toString()] = {
                        // @ts-ignore
                        ...user.toJSON(),
                        eventsCount: 1
                    };
                } else {
                    // @ts-ignore
                    people[user._id.toString()].eventsCount++;
                }
            });
        })

        return res.json({
            eventsCount,
            // @ts-ignore
            people: Object.values(people).sort((a, b) => b.eventsCount - a.eventsCount)
        });

    } catch (e) {

    }
}

export const getMutuals = async (req: Request, res: Response) => {
    try {

        const targetUserId = req.params.targetUserId;

        const profiles = await Models.SocialProfile.find({
            users: {
                $in: [req.user._id],
                $nin: [targetUserId]
            },
            status: {
                $nin: ["BLOCKED", "NONE"]
            }
        }).select("users");

        const users = profiles.map(profile => profile.users.filter(userId => userId.toString() !== req.user._id.toString() && userId.toString() !== targetUserId.toString())[0].toString());

        const targetUserProfiles = await Models.SocialProfile.find({
            users: {
                $in: [targetUserId],
                $nin: [req.user._id]
            },
            status: {
                $nin: ["BLOCKED", "NONE"]
            }
        }).select("users");

        const targetUsers = targetUserProfiles.map(profile => profile.users.filter(userId => userId.toString() !== req.user._id.toString() && userId.toString() !== targetUserId.toString())[0].toString());

        const mutuals = users.filter(user => targetUsers.includes(user));

        const mutualUsers = await Models.User.find({
            _id: {
                $in: mutuals
            }
        }).select("firstName lastName username profilePictureSource");

        return res.json({
            mutualCount: mutuals.length,
            mutuals: mutualUsers.map(user => ({
                _id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                profilePictureSource: user.profilePictureSource,
            }))
        });



    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }

}



