import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(__dirname, "../../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "foroshgahi-api" },
  transports: [
    // only errors
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // all logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// development mode
if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf((info) => {
          const { timestamp, level, message, stack, ...meta } = info;

          return [
            `${timestamp} [${level}]: ${message}`,
            stack ? `\n${stack}` : "",
            Object.keys(meta).length
              ? `\nMETA: ${JSON.stringify(meta, null, 2)}`
              : "",
          ].join("");
        })
      ),
    })
  );
}

export default logger;
