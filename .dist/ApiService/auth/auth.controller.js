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
exports.register = exports.confirmLogin = exports.login = void 0;
const shared_1 = require("../../shared");
const jwt = require("jsonwebtoken");
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username } = req.body;
            let user = yield shared_1.Models.User.findOne({ phoneNumber: username });
            let newUser = false;
            if (!user) {
                newUser = true;
                user = new shared_1.Models.User({
                    phoneNumber: username,
                    firstName: "new",
                    lastName: "new",
                });
                yield user.save();
            }
            ;
            const smsLogin = yield user.initSMSLogin();
            if (!smsLogin) {
                return res.status(500).json({
                    message: "Internal Server Error"
                });
            }
            return res.status(200).json({
                message: newUser ? "User created" : "User found",
            });
        }
        catch (e) {
            next(e);
        }
    });
}
exports.login = login;
function confirmLogin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, code } = req.body;
            const user = yield shared_1.Models.User.findOne({ phoneNumber: username });
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            const smsCode = yield user.checkSMSCode(code);
            if (!smsCode) {
                return res.status(400).json({
                    message: "Invalid code"
                });
            }
            else {
                return res.status(200).json({
                    message: user.isConfirmed ? "User confirmed" : "User not confirmed",
                    token: yield user.generateSessionToken(),
                });
            }
        }
        catch (e) {
            next(e);
        }
    });
}
exports.confirmLogin = confirmLogin;
function register(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let { authorization } = req.headers;
            authorization = String(authorization).replace("Bearer ", "");
            const token = jwt.verify(authorization, String(process.env.JWT_SECRET));
            const user = yield shared_1.Models.User.findById(String(token === null || token === void 0 ? void 0 : token._id));
            if (!user || user.isConfirmed) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.email = req.body.email;
            user.isConfirmed = true;
            yield user.save();
            return res.status(200).json({
                message: "User registered",
                token: yield user.generateSessionToken(),
            });
        }
        catch (e) {
            next(e);
        }
    });
}
exports.register = register;
//# sourceMappingURL=auth.controller.js.map