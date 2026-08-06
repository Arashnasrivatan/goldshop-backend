import cron from "node-cron";
import { PriceRepository } from "../../modules/Price/price.repository";
import logger from "../utils/logger";

const priceRepository = new PriceRepository();

const cleanUpOldPrices = async () => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await priceRepository.deleteMany({
      createdAt: { $lt: fortyEightHoursAgo },
    });
    
    logger.info(
      `Old prices cleaned up successfully. Deleted count: ${result?.deletedCount}`
    );
  } catch (err) {
    logger.error(`Cant delete old prices`, err);
  }
};

export const startDeletePriceCronJob = () => {
  cleanUpOldPrices();

  cron.schedule("0 */6 * * *", cleanUpOldPrices);
};