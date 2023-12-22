if (process.env.NODE_ENV !== "development") {
    require("newrelic");
}
import { config, Logger, Models } from "../shared";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import express from "express";

const server = async () => {

    await config();

    const app = express();

    Sentry.init({
        dsn: "https://10a86555e111192cab58a9a2181df08a@o1056243.ingest.sentry.io/4506441875193856",
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });

// The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    app.use(cors());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());
    app.use("/v1", routes);

    app.use(Sentry.Handlers.errorHandler());

    app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {

        res.status(500).json({
            message: "Server Error"
        })
    });

    app.listen(process.env.PORT || 4000, () => {
        Logger(process.env.SERVICE_NAME + " is running on port " + (process.env.PORT || 4000));
    });



}

server().catch((err) => {
    Logger(err);
    process.exit(1);
})



