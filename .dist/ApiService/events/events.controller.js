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
exports.confirm = exports.respond = exports.getOne = exports.getAll = exports.createEvent = void 0;
const shared_1 = require("../../shared");
const shared_2 = require("../../shared");
const moment = require("moment");
const _ = require("lodash");
function createEvent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield shared_1.Models.User.find({
                $or: [
                    {
                        phoneNumber: {
                            $in: req.body.contacts.map((contact) => contact.anchor)
                        }
                    },
                    {
                        email: {
                            $in: req.body.contacts.map((contact) => contact.anchor)
                        }
                    }
                ]
            }).select("_id");
            const event = new shared_1.Models.Event({
                name: req.body.name,
                createdBy: req.user._id,
                users: _.uniq([
                    req.user._id.toString(), ...users.map((user) => user._id.toString())
                ])
            });
            yield event.save();
            const availabilities = yield shared_1.Models.Availability.insertMany(req.body.availabilities.map((availability) => {
                return Object.assign(Object.assign({}, availability), { users: [
                        req.user._id
                    ], createdBy: req.user._id, event: event._id, isRequired: true });
            }));
            event.availabilities = availabilities.map((availability) => availability._id);
            event.contacts = req.body.contacts.map((contact) => {
                return {
                    anchor: contact.anchor
                };
            });
            yield event.save();
            res.json({
                message: "Event created",
                event: {
                    name: event.name,
                    link: `${process.env.FRONTEND_URL}/event/${event.publicId}`
                }
            });
            for (const contact of event.contacts)
                yield (0, shared_1.notifyOfEvent)(event, req.user, contact.anchor);
        }
        catch (e) {
            next(e);
        }
    });
}
exports.createEvent = createEvent;
function getAll(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const events = yield shared_1.Models.Event.find({
                status: ["pending", "confirmed"],
                users: {
                    $in: [req.user._id]
                }
            }).populate({
                path: "availabilities",
                select: "users"
            }).sort({ createdAt: -1 }).lean();
            res.json(events.map((event) => {
                let users = [];
                for (const availability of event.availabilities) {
                    for (const user of availability.users) {
                        users.push(user.toString());
                    }
                }
                users = _.uniq(users);
                return Object.assign(Object.assign({}, event), { respondedUsersCount: users.length, totalUsersCount: event.users.length });
            }));
        }
        catch (err) {
            (0, shared_1.Logger)(err);
            next(err);
        }
    });
}
exports.getAll = getAll;
function getOne(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userSelect = "firstName lastName";
            const event = yield shared_1.Models.Event.findOne({
                $or: [
                    {
                        publicId: req.params.eventId
                    },
                    {
                        _id: (0, shared_2.isObjectIdOrHexString)(req.params.eventId) ? req.params.eventId : undefined
                    }
                ]
            })
                .populate([{
                    path: "availabilities",
                }, {
                    path: "createdBy",
                    select: userSelect
                }, {
                    path: "users",
                    select: userSelect
                }]).lean();
            if (!event)
                return res.sendStatus(404);
            res.json(Object.assign(Object.assign({}, event), { availabilities: event.availabilities.map((availability) => (Object.assign(Object.assign({}, availability), { selected: !!availability.users.find((user) => String(user) === String(req.user._id)) }))) }));
        }
        catch (err) {
            (0, shared_1.Logger)(err);
            next(err);
        }
    });
}
exports.getOne = getOne;
function respond(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const event = yield shared_1.Models.Event.findOne({
                _id: req.params.eventId,
                users: {
                    $in: [req.user._id]
                }
            });
            if (!event)
                return res.sendStatus(404);
            if (req.body.newAvailabilities.length !== 0) {
                const existingAvailabilities = yield shared_1.Models.Availability.find({
                    event: event._id,
                    $or: req.body.newAvailabilities.map((availability) => {
                        return {
                            start: availability.start,
                            end: availability.end
                        };
                    })
                });
                req.body.newAvailabilities = req.body.newAvailabilities.filter((availability) => {
                    return !existingAvailabilities.find((existingAvailability) => {
                        console.log(moment(existingAvailability.start).toDate() === moment(availability.start).toDate());
                        return String(moment(existingAvailability.start).toDate())
                            === String(moment(availability.start).toDate())
                            && String(moment(existingAvailability.end).toDate())
                                === String(moment(availability.end).toDate());
                    });
                });
                console.log(req.body.newAvailabilities);
            }
            const newAvailabilities = yield shared_1.Models.Availability.insertMany(req.body.newAvailabilities.map((availability) => {
                console.log(Object.assign(Object.assign({}, availability), { users: [
                        req.user._id
                    ], createdBy: req.user._id, event: event._id, isRequired: true }));
                return Object.assign(Object.assign({}, availability), { users: [
                        req.user._id
                    ], createdBy: req.user._id, event: event._id, isRequired: true });
            }));
            console.log(newAvailabilities);
            yield shared_1.Models.Availability.updateMany({
                _id: {
                    $in: req.body.selectedAvailabilities
                },
                users: {
                    $nin: [req.user._id]
                },
                event: event._id
            }, {
                $push: {
                    users: req.user._id
                }
            });
            yield shared_1.Models.Availability.updateMany({
                _id: {
                    $nin: req.body.selectedAvailabilities
                },
                users: {
                    $in: [req.user._id]
                },
                event: event._id
            }, {
                $pull: {
                    users: req.user._id
                }
            });
            event.availabilities = [...event.availabilities, ...newAvailabilities.map((availability) => availability._id)];
            event.contacts = [...event.contacts, ...req.body.contacts.map((contact) => {
                    return {
                        anchor: contact.anchor
                    };
                })];
            const users = yield shared_1.Models.User.find({
                $or: [
                    {
                        email: {
                            $in: req.body.contacts.map((contact) => contact.anchor)
                        }
                    },
                    {
                        phone: {
                            $in: req.body.contacts.map((contact) => contact.anchor)
                        }
                    }
                ],
            }).select("_id");
            event.users = [
                ...event.users,
                ...users
                    .filter((user) => !event.users.find((eventUser) => String(eventUser) === String(user._id)))
                    .map((user) => user._id)
            ];
            yield event.save();
            res.json({
                message: "Response processed",
                event: {
                    name: event.name,
                    link: `${process.env.FRONTEND_URL}/event/${event.publicId}`,
                }
            });
            for (const contact of req.body.contacts)
                yield (0, shared_1.notifyOfEvent)(event, req.user, contact.anchor);
        }
        catch (err) {
            (0, shared_1.Logger)(err);
            next(err);
        }
    });
}
exports.respond = respond;
function confirm(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.params.eventId);
            const event = yield shared_1.Models.Event.findOne({
                _id: req.params.eventId,
                createdBy: req.user._id
            }).populate({
                path: "users",
                select: "firstName lastName email phoneNumber"
            });
            if (!event)
                return res.sendStatus(404);
            event.start = req.body.start;
            event.end = req.body.end;
            event.status = "confirmed";
            yield event.save();
            const ics = yield event.ics(req.user, event.users);
            for (const userRaw of event.users) {
                let user = userRaw;
                if (user.email)
                    yield (0, shared_1.notifyOfEventConfirmation)(event, req.user, user.email, `${process.env.FRONTEND_URL}/event/${event.publicId}`, ics.value);
            }
            return res.sendStatus(200);
        }
        catch (err) {
            (0, shared_1.Logger)(err);
            next(err);
        }
    });
}
exports.confirm = confirm;
//# sourceMappingURL=events.controller.js.map