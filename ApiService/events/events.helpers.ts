import { NextFunction, Request, Response } from "express";
import { AWS, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import { ObjectId } from "bson";
import moment = require("moment");
import { IMedia } from "shared/@types/Media";
import { MediaInternetType } from "../../shared/@types/public";
import mongoose from "mongoose";
import { EventObject } from "../@types/dto";
import { IEvent } from "shared/models/Event";

export async function eventsDTOs(req: Request, query: { [key: string]: any }) {
    const skip = req.query.skip ? req.query.skip : 0;

    // @ts-ignore
    const events = await Models.Event.find(query)
        .sort({ startsAt: -1 })
        .skip(Number(skip)).limit(Number(req.query?.limit) || 100)
        .populate([{
            path: "cover",
        },
            {
                path: "users",
                select: "firstName lastName profilePictureSource username",
                options: {
                    limit: 6
                }
            }])
        .select("-media");


    return await Promise.all(events.map(async (event, i) => {

            const cover = event.cover as IMedia;


            const media = await Models.Media.countDocuments({
                event: event._id
            })

            return {
                ...event.toJSON(),
                peopleCount: Number((await Models.Event.findById(event._id))?.users.length) + event.invitees?.length + event.nonUsersInvitees?.length,
                mediaCount: event.content.length,
                users: undefined,
                invitees: undefined,
                nonUsersInvitees: undefined,
                media: undefined,
                cover: undefined,
                people: [
                    ...event.users,
                ],
                content: undefined,
                thumbnailUrl: await cover?.getThumbnailLocation(),
            }

        }))

}