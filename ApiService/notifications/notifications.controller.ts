import {NextFunction, Request, Response} from "express";
import {GCP, Models} from "../../shared";
import * as jwt from "jsonwebtoken";
import {v4} from "uuid";

export async function get (req: Request, res: Response, next: NextFunction) {

    try {

        const skip = req.query.skip ? req.query.skip : 0;

        const notifications = await Models.Notification.find({}).skip(Number(skip)).limit(10);

        res.status(200).json(notifications);


    } catch (e) {
        next(e);
    }

}
