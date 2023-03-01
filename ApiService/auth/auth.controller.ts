import {NextFunction, Request, Response} from "express";
import {Models} from "../../shared";
import * as jwt from "jsonwebtoken";
import moment = require("moment");

export async function login (req: Request, res: Response, next: NextFunction) {

    try {
        const {phoneNumber} = req.body;

        let user = await Models.User.findOne({phoneNumber: phoneNumber});

        let newUser = false;
        if (!user) {
            newUser = true;
            user = new Models.User({
                phoneNumber,
            });
            await user.save();
        };

        const smsLogin = await user.initSMSLogin();
        if(!smsLogin) {
            return res.status(500).json({
                message: "Internal Server Error"
            });
        }

        return res.status(200).json({
            message: newUser ? "User created" : "User found",
        });
    } catch (e) {
        next(e);
    }



}

export async function confirmLogin (req: Request, res: Response, next: NextFunction) {
    try {
        const {username, code} = req.body;

        const user = await Models.User.findOne({phoneNumber: username});
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const smsCode = await user.checkSMSCode(code);
        if (!smsCode) {
            return res.status(400).json({
                message: "Invalid code"
            });
        } else {
            const notification = new Models.Notification({
                user: user._id,
                title: "New connection to your account",
                body: "You have logged in to your account from a new device",
                data: {
                    type: "login",
                    payload: {
                        user: user._id,
                    }
                }
            });
            await notification.save();
            await notification.notify();

            return res.status(200).json({
                message: user.isConfirmed && !user.isOnWaitList ? "User confirmed" : "User not confirmed",
                token: await user.generateSessionToken(),
            })
        }
    } catch (e) {
        next(e);
    }

}

export async function register (req: Request, res: Response, next: NextFunction) {

    try {
        let {authorization} = req.headers;

        authorization = String(authorization).replace("Bearer ", "");
        const token: any = jwt.verify(authorization, String(process.env.JWT_SECRET));

        const user = await Models.User.findById(String(token?._id));
        if (!user || (user.isConfirmed && !user.isOnWaitList)) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.body.firstName) {
            user.firstName = req.body.firstName;
        }

        if (req.body.lastName) {
            user.lastName = req.body.lastName;
        }

        if (req.body.birthDate) {
            if (moment(req.body.birthDate).isAfter(moment().subtract(13, "years"))) {
                return res.status(400).json({
                    message: "You must be at least 13 years old"
                });
            }
            user.birthDate = req.body.birthDate;
        }

        if (req.body.email) {
            if (await Models.User.countDocuments({email: req.body.email, _id: {$ne: user._id}})) {
                return res.status(400).json({
                    message: "This email is taken"
                });
            }
            user.email = req.body.email;
        }

        if (req.body.username) {
            if (await Models.User.countDocuments({username: req.body.username, _id: {$ne: user._id}})) {
                return res.status(400).json({
                    message: "This username is taken"
                });
            }
            user.username = req.body.username;
        }

        if(
            user.firstName &&
            user.lastName &&
            user.birthDate &&
            user.email &&
            user.username
        ) {
            user.isConfirmed = true;
        }

        if(req.body.eventId && user.isOnWaitList) {
            const event = await Models.Event.findOne({
                publicId: req.body.eventId,
            }).select("_id");

            if(event) {
                user.isOnWaitList = false;
            }
        }

        await user.save();

        return res.status(200).json({
            message: "User registered",
            token: await user.generateSessionToken(),
        });
    } catch (e) {
        next(e);
    }



}

export const check = (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).json({
            status: req.user.isOnWaitList ? "waitlist" : req.user.isConfirmed ? "confirmed" : "unconfirmed",
        });
    } catch (e) {
        next(e);
    }
}

export async function notificationLink (req: Request, res: Response, next: NextFunction) {
    try {
        const {authorization} = req.headers;

        let userId: string | null;
        try {
            const token: any = jwt.verify(String(authorization).replace("Bearer ", ""), String(process.env.JWT_SECRET));
            userId = String(token?._id);
        } catch (e) {
            userId = null;
        }

        await Models.PushToken.updateOne({
            to: req.body.pushToken
        }, {
            $set: {
                user: userId,
            to: req.body.pushToken,
            }
        }, {
            upsert: true,
        });

        return res.status(200).json({
            message: "Push token updated",
        });

    } catch (e) {
        next(e);
    }
}
