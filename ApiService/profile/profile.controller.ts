import {NextFunction, Request, Response} from "express";
import {Models} from "../../shared";
import * as jwt from "jsonwebtoken";

export async function login (req: Request, res: Response, next: NextFunction) {

    try {
        const {username} = req.body;

        let user = await Models.User.findOne({phoneNumber: username});

        let newUser = false;
        if (!user) {
            newUser = true;
            user = new Models.User({
                phoneNumber: username,
                firstName: "new",
                lastName: "new",
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
            return res.status(200).json({
                message: user.isConfirmed ? "User confirmed" : "User not confirmed",
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
        if (!user || user.isConfirmed) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.isConfirmed = true;
        await user.save();

        return res.status(200).json({
            message: "User registered",
            token: await user.generateSessionToken(),
        });
    } catch (e) {
        next(e);
    }



}