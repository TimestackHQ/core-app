import "newrelic";
import {config, Logger, Models} from "../shared";
import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import routes from "./routes";
import {NextFunction, Request, Response} from "express";
import * as bodyParser from "body-parser";

const server = async () => {

    await config();

    const app = express();

    app.use(cors());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {

        res.status(500).json({
            message: "Server Error"
        })
    });

    app.listen(process.env.PORT || 4000, () => {
        Logger(process.env.SERVICE_NAME+" is running on port "+(process.env.PORT || 4000));
    });

    app.use("/v1", routes);

}

server().catch((err) => {
    Logger(err);
    process.exit(1);
})



