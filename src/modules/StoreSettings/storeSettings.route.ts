import express, { Router } from "express";
import authGuard from "../../common/middlewares/authGuard";
import roleGuard from "../../common/middlewares/roleGuard";
import validate from "../../common/middlewares/validate";
import { StoreSettingsController } from "./storeSettings.controller";
import { StoreSettingsRepository } from "./storeSettings.repository";
import { StoreSettingsService } from "./storeSettings.service";
import { updateCheckoutStatusSchema } from "./storeSettings.validation";

const repository = new StoreSettingsRepository();
const service = new StoreSettingsService(repository);
const controller = new StoreSettingsController(service);
const router: Router = express.Router();

router.route("/checkout")
  .get(controller.getCheckoutStatus)
  .patch(
    authGuard,
    roleGuard("SUPER_ADMIN", "ADMIN"),
    validate(updateCheckoutStatusSchema),
    controller.updateCheckoutStatus,
  );

export default router;
