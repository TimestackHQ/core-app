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
const utils_1 = require("./utils");
const mongoose_1 = require("mongoose");
const moment = require("moment");
const twilio = require("twilio");
const index_1 = require("../index");
const SMSCodeSchema = new mongoose_1.default.Schema(Object.assign({ user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    }, code: {
        type: String,
        required: true,
    }, phoneNumber: {
        type: String,
        required: true,
    }, isConfirmed: {
        type: Boolean,
        default: false,
    }, expiresAt: {
        type: Date,
        required: true,
        default: moment().add(5, "minutes").toDate(),
    }, twilioMessageId: {
        type: String,
        required: false,
    } }, utils_1.commonProperties));
SMSCodeSchema.methods.sendSMS = function (code) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        try {
            if (process.env.NODE_ENV === "development") {
                (0, index_1.Logger)(`SMS sent to ${this.phoneNumber} with code: ${code}`);
                return true;
            }
            else {
                const message = yield (0, index_1.sendTextMessage)(code + ' is your Timestack authentication code.\n' +
                    '\n' +
                    'We will never ask you to share this code.', this.phoneNumber);
                this.twilioMessageId = message.sid;
            }
            return true;
        }
        catch (e) {
            (0, index_1.Logger)(e);
            return false;
        }
    });
};
exports.default = mongoose_1.default.model("SMSCode", SMSCodeSchema);
//# sourceMappingURL=SMSCode.js.map