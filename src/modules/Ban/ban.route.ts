import express, { Router } from "express";
import { BanController } from "./ban.controller";
import validate from "./../../common/middlewares/validate";
import roleGuard from "./../../common/middlewares/roleGuard";
import {
  banUserSchema,
  getAllBansParamsSchema,
  banIdParamsSchema,
  editBanSchema,
} from "./ban.validation";

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
  .route("/:banId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(banIdParamsSchema, "params"),
    banController.getBanById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(banIdParamsSchema, "params"),
    validate(editBanSchema),
    banController.editBan,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(banIdParamsSchema, "params"),
    banController.unban,
  );

export default router;
