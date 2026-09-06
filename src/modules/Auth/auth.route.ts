import express, { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import validate from "./../../common/middlewares/validate";
import {
  sentSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
} from "./auth.validation";
import passport from "passport";
import authGuard from "../../common/middlewares/authGuard";
import { createRateLimiter } from "../../common/middlewares/rateLimit";

import { UserRepository } from "../User/user.repository";
import { BanRepository } from "./../Ban/ban.repository";

import { UserService } from "../User/user.service";
import { BanService } from "../Ban/ban.service";
import { redisService } from "../../common/services/redis.service";

const userRepository = new UserRepository();
const banRepository = new BanRepository();

const userService = new UserService(userRepository, redisService);
const banService = new BanService(banRepository, userService);
const authService = new AuthService(userService, banService, redisService);

const authController = new AuthController(authService);

const router: Router = express.Router();

const sendOtpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message: "Too many OTP requests. Please try again after 10 minutes.",
});

const verifyOtpLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10,
  message: "Too many verification attempts. Please try again later.",
});

const loginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 5,
  message:
    "Too many password reset requests. Please try again after 30 minutes.",
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 10,
  message:
    "Too many password reset attempts. Please try again after 30 minutes.",
});

//* Routes

//* ========== Authentication Routes ========== *\\

router
  .route("/send")
  .post(sendOtpLimiter, validate(sentSchema), authController.sendOTP);

router
  .route("/verify")
  .post(verifyOtpLimiter, validate(verifySchema), authController.verifyOTP);

router
  .route("/login")
  .post(
    loginLimiter,
    validate(loginSchema),
    passport.authenticate("local", { session: false }),
    authController.login,
  );

router
  .route("/forgot-password")
  .post(
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword,
  );

router
  .route("/reset-password/:token")
  .post(
    resetPasswordLimiter,
    validate(resetPasswordParamsSchema, "params"),
    validate(resetPasswordSchema),
    authController.resetPassword,
  );
router.route("/me").get(authGuard, authController.getMe);

router
  .route("/refresh")
  .get(
    passport.authenticate("refreshToken", { session: false }),
    authController.refreshToken,
  );

router.route("/logout").post(authController.logout);

export default router;
