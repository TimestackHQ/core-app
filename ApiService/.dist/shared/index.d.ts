/// <reference types="node" />
import * as Models from "./models";
import { Request, Response, NextFunction } from "express";
import { ValidationResult } from "joi";
import * as sgMail from "@sendgrid/mail";
import { UserSchema } from "./models/User";
import { EventSchema } from "./models/Event";
import { isObjectIdOrHexString } from "mongoose";
export declare const emailRegex: RegExp;
export declare function Logger(...args: any[]): void;
export declare function config(): Promise<void>;
export declare const HTTPValidator: (validator: (arg0: unknown) => ValidationResult) => (req: Request, res: Response, next: NextFunction) => void;
export declare function authCheck(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare const PhoneNumberValidator: () => any;
export declare function sendTextMessage(body: string, to: string, mediaUrl?: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
export declare const sendEmail: (to: string, subject: string, text: string, html: string, attachments?: {
    filename: string;
    type: string;
    content: Buffer;
    disposition: string;
}[]) => Promise<[sgMail.ClientResponse, {}]>;
export declare function notifyOfEvent(event: EventSchema, user: UserSchema, anchor: string): Promise<void>;
export declare const notifyOfEventConfirmation: (event: EventSchema, user: UserSchema, anchor: string, inviteLink: string, ics: string) => Promise<void>;
export declare const isObjectIdJoiValidator: any;
export { isObjectIdOrHexString, Models, };
