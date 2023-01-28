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
const shared_1 = require("../shared");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes_1 = require("./routes");
const server = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, shared_1.config)();
    const app = express();
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(function (err, req, res, next) {
        res.status(500).json({
            message: "Server Error"
        });
    });
    app.listen(process.env.PORT || 4000, () => {
        (0, shared_1.Logger)(process.env.SERVICE_NAME + " is running on port " + (process.env.PORT || 4000));
    });
    app.use("/v1", routes_1.default);
});
server().catch((err) => {
    (0, shared_1.Logger)(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map