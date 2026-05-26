import { Queue } from "bullmq";
import { env } from "../config/env.js";

export const quoteRefreshQueue = env.redisUrl
  ? new Queue("quote-refresh", { connection: { url: env.redisUrl } })
  : undefined;

export const alertEvaluationQueue = env.redisUrl
  ? new Queue("alert-evaluation", { connection: { url: env.redisUrl } })
  : undefined;
