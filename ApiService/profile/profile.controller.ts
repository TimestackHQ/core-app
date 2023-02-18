import {NextFunction, Request, Response} from "express";
import {GCP, Models} from "../../shared";
import * as jwt from "jsonwebtoken";
import {v4} from "uuid";

export async function get (req: Request, res: Response, next: NextFunction) {

    try {

        return res.status(200).json({
            ...req.user.toJSON(),
        })

    } catch (e) {
        next(e);
    }

}

export async function picture (req: Request, res: Response, next: NextFunction) {

    try {

        const file: Express.Multer.File | undefined = req.file;
        if (!file) {
            return res.status(400).json({
                message: "No file provided"
            });
        } else if (file.size > 10000000) {
            return res.status(400).json({
                message: "File size too large"
            });
        } else if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "File is not an image"
            });
        }


        const fileName = v4()+"."+file.originalname.split(".").pop();

        await GCP.upload(fileName, <Buffer>file.buffer, "timestack-profiles");

        req.user.profilePictureSource = "https://storage.googleapis.com/timestack-profiles/"+fileName;
        await req.user.save();

        return res.status(200).json({
            message: "Profile picture updated",
            profilePictureSource: req.user.profilePictureSource
        });



    } catch (e) {
        next(e);
    }

}

export async function editProfile (req: Request, res: Response, next: NextFunction) {

    try {

        const {username, firstName, lastName, email, phoneNumber} = req.body;

        if (username) {
            if(await Models.User.countDocuments({username})) {
                return res.status(400).json({
                    message: "This username is taken"
                });
            }
        }

        if (firstName) {
            req.user.firstName = firstName;
        }

        if (lastName) {
            req.user.lastName = lastName;
        }

        if (email) {
            req.user.email = email;
        }

        if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
            if(await Models.User.countDocuments({phoneNumber})){
                return res.status(400).json({
                    message: "This phone number is taken"
                });
            }
            req.user.isConfirmed = false;
            req.user.phoneNumber = phoneNumber;
        }

        await req.user.save();
        //
        // await req.user.pushEvent("profileUpdate", {
        //     ...req.body
        // })

        return res.status(200).json({
            message: "Profile updated",
            user: req.body
        });

    } catch (e) {
        next(e);
    }

}
