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
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const utils_1 = require("./utils");
const SMSCode_1 = require("./SMSCode");
const index_1 = require("../index");
const UserSchema = new mongoose.Schema(Object.assign({ firstName: {
        type: String,
        required: false,
    }, lastName: {
        type: String,
        required: true,
    }, email: {
        type: String,
        unique: false,
    }, phoneNumber: {
        type: String,
        unique: true,
    }, isConfirmed: {
        type: Boolean,
        default: false,
    } }, utils_1.commonProperties));
UserSchema.methods.initSMSLogin = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const code = Math.floor(100000 + Math.random() * 900000);
        try {
            const smsCode = new SMSCode_1.default({
                user: this._id,
                code: code.toString(),
                phoneNumber: this.phoneNumber,
            });
            yield smsCode.save();
            yield smsCode.sendSMS(code);
        }
        catch (e) {
            (0, index_1.Logger)(e);
            return false;
        }
        return true;
    });
};
UserSchema.methods.checkSMSCode = function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        const smsCode = yield SMSCode_1.default.findOne({ user: this._id, code: code, isConfirmed: false }).sort({ createdAt: -1 });
        if (!smsCode)
            return false;
        smsCode.isConfirmed = true;
        yield smsCode.save();
        return true;
    });
};
UserSchema.methods.generateSessionToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jwt.sign({
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phoneNumber: this.phoneNumber,
            isConfirmed: this.isConfirmed,
        }, String(process.env.JWT_SECRET), { expiresIn: "1w" });
    });
};
exports.default = mongoose.model("User", UserSchema);
//# sourceMappingURL=User.js.map