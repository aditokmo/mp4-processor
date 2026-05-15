import rateLimit from "express-rate-limit";

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many upload requests, please try again later.",
  },
});