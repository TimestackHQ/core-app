"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Models = exports.isObjectIdOrHexString = exports.isObjectIdJoiValidator = exports.notifyOfEventConfirmation = exports.notifyOfEvent = exports.sendEmail = exports.sendTextMessage = exports.PhoneNumberValidator = exports.authCheck = exports.HTTPValidator = exports.config = exports.Logger = exports.emailRegex = void 0;
const mongoose = require("mongoose");
const Models = require("./models");
exports.Models = Models;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const mongoose_1 = require("mongoose");
Object.defineProperty(exports, "isObjectIdOrHexString", { enumerable: true, get: function () { return mongoose_1.isObjectIdOrHexString; } });
const JoiObjectId = require("joi-objectid");
const moment = require("moment");
exports.emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
function Logger(...args) {
    console.log(...args);
}
exports.Logger = Logger;
function config() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect(String(process.env.MONGODB_URI), {});
            Logger(`${process.env.SERVICE_NAME} connected to MongoDB`);
        }
        catch (err) {
            Logger(err);
            process.exit(1);
        }
    });
}
exports.config = config;
const HTTPValidator = (validator) => {
    return (req, res, next) => {
        var _a;
        const { error } = validator(req.body);
        if (error)
            res.status(400).json({
                message: (_a = Object(error)) === null || _a === void 0 ? void 0 : _a.details[0].message
            });
        else
            next();
    };
};
exports.HTTPValidator = HTTPValidator;
function authCheck(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = String(req.headers.authorization).split(" ")[1];
            jwt.verify(token, String(process.env.JWT_SECRET));
            const decodedToken = jwt.decode(token);
            req.user = yield Models.User.findById(String(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id)).select("-events -password");
            next();
        }
        catch (e) {
            console.log(e);
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
    });
}
exports.authCheck = authCheck;
const PhoneNumberValidator = () => Joi.extend(require("joi-phone-number")).string().phoneNumber({
    format: 'international'
});
exports.PhoneNumberValidator = PhoneNumberValidator;
function sendTextMessage(body, to, mediaUrl) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    return client.messages
        .create({
        body,
        to,
        from: String(process.env.TWILIO_PHONE_NUMBER),
        mediaUrl
    });
}
exports.sendTextMessage = sendTextMessage;
const sendEmail = (to, subject, text, html, attachments = []) => sgMail.send({
    to,
    from: {
        name: "Timestack",
        email: 'hello@timestack.world'
    },
    subject,
    text,
    html,
    attachments
});
exports.sendEmail = sendEmail;
function notifyOfEvent(event, user, anchor) {
    return __awaiter(this, void 0, void 0, function* () {
        const inviteLink = `${process.env.FRONTEND_URL}/event/${event.publicId}`;
        try {
            if (exports.emailRegex.test(anchor)) {
                const html = fs
                    .readFileSync(path.join(__dirname, "email/eventInviteTemplate.html"))
                    .toString();
                const engine = Handlebars.compile(html);
                const htmlToSend = engine({
                    hostFirstName: String(user.firstName),
                    anchor: String(anchor),
                    eventName: event.name,
                    inviteLink
                });
                yield (0, exports.sendEmail)(anchor, `${user.firstName} invited you to ${event.name}`, htmlToSend, htmlToSend);
            }
            else {
                yield sendTextMessage(user.firstName + ' invites you to an event: ' + event.name +
                    '\n' +
                    'Click here to add your availabilities: ' + `${inviteLink}`, anchor);
            }
        }
        catch (err) {
            console.log(err.response.body);
        }
    });
}
exports.notifyOfEvent = notifyOfEvent;
const notifyOfEventConfirmation = (event, user, anchor, inviteLink, ics) => __awaiter(void 0, void 0, void 0, function* () {
    const html = fs
        .readFileSync(path.join(__dirname, "email/eventConfirmTemplate.html"))
        .toString();
    const engine = Handlebars.compile(html);
    const htmlToSend = engine({
        firstName: String(user.firstName),
        startDate: moment(event.start).format("dddd, MMMM Do YYYY"),
        startTime: moment(event.start).format("h:mm a"),
        endTime: moment(event.end).format("h:mm a"),
        anchor: String(anchor),
        eventName: event.name,
        inviteLink
    });
    console.log(anchor, `${user.firstName} invited you to ${event.name}`, [{
            filename: "invite.ics",
            type: "text/calendar",
            content: Buffer.from(ics),
            disposition: "attachment"
        }]);
    yield (0, exports.sendEmail)(anchor, `${user.firstName} invited you to ${event.name}`, htmlToSend, htmlToSend, [{
            filename: "invite.ics",
            type: "text/calendar",
            content: Buffer.from(ics).toString('base64'),
            disposition: "attachment"
        }]);
});
exports.notifyOfEventConfirmation = notifyOfEventConfirmation;
exports.isObjectIdJoiValidator = JoiObjectId(Joi);
//# sourceMappingURL=index.js.map