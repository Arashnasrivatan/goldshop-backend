import express, { Router } from "express";
import { PriceController } from "./price.controller";
import validate from "./../../common/middlewares/validate";
import {getPriceHistoryQuerySchema} from "./price.validation";

import { PriceService } from "./../Price/price.service";
import { PriceRepository } from "../Price/price.repository";

const priceRepository = new PriceRepository();

const priceService = new PriceService(priceRepository);

const priceController = new PriceController(priceService);

const router: Router = express.Router();

//* Routes
router.route("/latest").get(priceController.getLatestPrice);

router
  .route("/history")
  .get(validate(getPriceHistoryQuerySchema, "query"), priceController.getPriceHistory);

export default router;
