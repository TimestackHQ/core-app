import {config, Logger} from "../shared";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import * as Sentry from "@sentry/node";
import {ProfilingIntegration} from "@sentry/profiling-node";
import express from "express";

const server = async () => {
    await config();
    const app = express();

    initializeSentry(app);
    configureMiddleware(app);
    configureErrorHandler(app);
    initializeServer(app);
}

const initializeSentry = (app: express.Application) => {
    Sentry.init({
        dsn: "https://10a86555e111192cab58a9a2181df08a@o1056243.ingest.sentry.io/4506441875193856",
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({tracing: true}),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({app}),
            new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });
}

const configureMiddleware = (app: express.Application) => {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(cors());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());
    app.use("/v1", routes);
    app.use(Sentry.Handlers.errorHandler());
}

const configureErrorHandler = (app: express.Application) => {
    app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
        res.status(500).json({
            message: "Server Error"
        })
    });
}

const initializeServer = (app: express.Application) => {
    const defaultPort = 4000;
    const port = process.env.PORT || defaultPort;
    app.listen(port, () => {
        Logger(`${process.env.SERVICE_NAME} is running on port ${port}`);
    });
}

server().catch((err) => {
    Logger(err);
    process.exit(1);
})



