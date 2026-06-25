import express, { Router } from "express";
import { UserController } from "./user.controller";
import validate from "./../../common/middlewares/validate";
import roleGuard from "./../../common/middlewares/roleGuard";
import authGuard from "../../common/middlewares/authGuard";
import {
  updateUserSchema,
  getAllUsersParamsSchema,
  updateMeSchema,
  changePasswordSchema,
  addressIdParamsSchema,
  updateAddressSchema,
  adminUserDeleteSchema,
  adminAddUserAddressSchema,
  adminUpdateUserAddressSchema,
  adminDeleteUserAddressSchema,
  deleteMeSchema,
  addAddressSchema,
  deleteAddressSchema,
} from "./user.validation";
import { userIdParamsSchema } from "../../common/utils/validation/params/sharedValidators";

import { UserService } from "./../User/user.service";
import { UserRepository } from "../User/user.repository";

const userRepository = new UserRepository();

const userService = new UserService(userRepository);

const userController = new UserController(userService);

const router: Router = express.Router();

//* Routes

//* ========== Admin User Management ========== *\\

router
  .route("/")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(getAllUsersParamsSchema, "query"),
    userController.getAllUsers,
  );

//* ========== User Management ========== *\\

router
  .route("/me")
  .get(authGuard, userController.getMe)
  .patch(authGuard, validate(updateMeSchema), userController.updateMe)
  .delete(authGuard, validate(deleteMeSchema), userController.deleteMe);

router.patch(
  "/me/password",
  authGuard,
  validate(changePasswordSchema),
  userController.changePassword,
);

//* =========== User Address Management ========== *\\

router
  .route("/me/addresses")
  .post(authGuard, validate(addAddressSchema), userController.addMyAddress);

router
  .route("/me/addresses/:addressId")
  .patch(
    authGuard,
    validate(addressIdParamsSchema, "params"),
    validate(updateAddressSchema),
    userController.updateMyAddress,
  )
  .delete(
    authGuard,
    validate(addressIdParamsSchema, "params"),
    validate(deleteAddressSchema),
    userController.deleteMyAddress,
  );

//* ========== Admin User Management ========== *\\

router
  .route("/:userId")
  .get(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    userController.getUserById,
  )
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    validate(updateUserSchema),
    userController.updateUser,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN"),
    validate(userIdParamsSchema, "params"),
    validate(adminUserDeleteSchema),
    userController.deleteUser,
  );

//* ========== Admin User Address Management ========== *\\

router
  .route("/:userId/addresses")
  .post(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    validate(adminAddUserAddressSchema),
    userController.adminAddUserAddress,
  );

router
  .route("/:userId/addresses/:addressId")
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    validate(addressIdParamsSchema, "params"),
    validate(adminUpdateUserAddressSchema),
    userController.adminUpdateUserAddress,
  )
  .delete(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(userIdParamsSchema, "params"),
    validate(addressIdParamsSchema, "params"),
    validate(adminDeleteUserAddressSchema),
    userController.adminDeleteUserAddress,
  );

//* ========== Admin User Role Management ========== *\\

router.patch(
  "/:userId/promote",
  authGuard,
  roleGuard("SUPER_ADMIN"),
  validate(userIdParamsSchema, "params"),
  userController.promoteUser,
);

router.patch(
  "/:userId/demote",
  authGuard,
  roleGuard("SUPER_ADMIN"),
  validate(userIdParamsSchema, "params"),
  userController.demoteUser,
);

export default router;
