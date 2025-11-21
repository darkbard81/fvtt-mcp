import pino from "pino";
import { Counter, collectDefaultMetrics, Registry } from "prom-client";
import { LogLevel } from "../types/types.js";
import { cfg } from "../config.js";

// Create Pino logger
const logger = pino({
  level: cfg.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Create Prometheus metrics with typed labels
const logCounter = new Counter({
  name: "pino_logs_total",
  help: "Total number of log messages",
  labelNames: ["level"] as const,
});

const register = new Registry();
register.setDefaultLabels({ app: "foundryvtt-mcp-relay" });
register.registerMetric(logCounter);
collectDefaultMetrics({ register });

export const log = {
  info: (message: string, meta: object = {}) => {
    logCounter.inc({ level: LogLevel.INFO });
    logger.info(meta, message);
  },
  warn: (message: string, meta: object = {}) => {
    logCounter.inc({ level: LogLevel.WARN });
    logger.warn(meta, message);
  },
  error: (message: string, meta: object = {}) => {
    logCounter.inc({ level: LogLevel.ERROR });
    logger.error(meta, message);
  },
  debug: (message: string, meta: object = {}) => {
    logCounter.inc({ level: LogLevel.DEBUG });
    logger.debug(meta, message);
  },
} as const;

export { register };
