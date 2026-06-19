import express, { Router } from "express";
import { BanController } from "./ban.controller";
import validate from "./../../common/middlewares/validate";
import roleGuard from "./../../common/middlewares/roleGuard";
import { banUserSchema, getAllBansParamsSchema } from "./ban.validation";
import { userIdParamsSchema } from "../../common/utils/validation/params/sharedValidators";

import authGuard from "../../common/middlewares/authGuard";

import { BanRepository } from "./../Ban/ban.repository";

import { BanService } from "../Ban/ban.service";
import { UserService } from "./../User/user.service";
import { UserRepository } from "../User/user.repository";

const userRepository = new UserRepository();
const banRepository = new BanRepository();

const userService = new UserService(userRepository);
const banService = new BanService(banRepository, userService);

const banController = new BanController(banService);

const router: Router = express.Router();

//* Routes

//* ========== Admin Ban Management ========== *\\
router
  .route("/")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllBansParamsSchema, "query"),
    banController.getAllBans,
  )
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(banUserSchema),
    banController.ban,
  );

router
  .route("/:userId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    banController.getBannedUserById,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    banController.unban,
  );

export default router;
