import express, { Router } from "express";
import authGuard from "../../common/middlewares/authGuard";
import roleGuard from "../../common/middlewares/roleGuard";
import validate from "../../common/middlewares/validate";
import { PriceRepository } from "../Price/price.repository";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { getDashboardSchema } from "./dashboard.validation";

const dashboardRepository = new DashboardRepository();
const priceRepository = new PriceRepository();
const dashboardService = new DashboardService(
  dashboardRepository,
  priceRepository,
);
const dashboardController = new DashboardController(dashboardService);
const router: Router = express.Router();

router.get(
  "/",
  authGuard,
  roleGuard("SUPER_ADMIN", "ADMIN"),
  validate(getDashboardSchema, "query"),
  dashboardController.getDashboard,
);

export default router;
