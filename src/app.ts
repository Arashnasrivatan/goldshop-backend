import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import configs from "./configs/env.config";
import cors from "cors";
import helmet from "helmet";
import { setHeaders } from "./common/middlewares/setHeaders";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./common/utils/logger";
import path from "path";
import passportConfig from "./configs/passport.config";
import errorHandler from "./common/middlewares/errorHandler";
import { AppError } from "./common/errors/AppError";
import apiRouter from "./modules";

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* Static Files
// app.use(express.static(path.resolve(__dirname, "..", "public")));
app.use(
  express.static(
    path.resolve(__dirname, "..", "public/goldshop-frontend/public"),
  ),
);

//* Helmet
app.use(helmet());

//* Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 35,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handler: (_req: Request, _res: Response) => {
    throw new Error("Too many requests from this IP, please try again later.");
  },
});
app.use(limiter);

//* Cors Policy
app.use(setHeaders);
app.use(cookieParser());
app.use(
  cors({
    origin: configs.app.cors,
    credentials: true,
  }),
);

//* Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
}
//* Session
app.use(
  session({
    secret: configs.app.sessionSecretKey as string,
    resave: false,
    saveUninitialized: false,
  }),
);

//* Passport
// TODO
app.use(passportConfig.initialize());
app.use(passportConfig.session());

//* Routes
app.use(apiRouter);

//* 404 Handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const path = _req.originalUrl;
  next(
    new AppError(
      `404! This ${path} Path Not Found! Please Check The Path Or Method...`,
      404,
    ),
  );
});

//* Global Error Handler
app.use(errorHandler);

export default app;
