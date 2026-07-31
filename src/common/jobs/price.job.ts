// src/jobs/price.job.ts
import cron from "node-cron";
import { socketManager } from "../../configs/socket.config";
import { PriceRepository } from "../../modules/Price/price.repository";
import logger from "../utils/logger";

const priceRepository = new PriceRepository();

// Helper function to generate mock prices (Temporary)
const generateRandomPrice = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const startPriceCronJob = () => {
  const pricesNamespace = socketManager.getNamespace("/prices");

  pricesNamespace.on("connection", async (socket) => {
    try {
      const latestPrice = await priceRepository.findLatest();
      
      if (latestPrice) {
        socket.emit("livePricesUpdate", latestPrice);
      }
    } catch (err) {
      logger.error("Error fetching latest price for new connection:", err);
    }
  });

  // Pattern '* * * * *' executes exactly at minute 00 of every minute
  cron.schedule("* * * * *", async () => {
    try {
      // TODO: In the future, this section will be replaced with real API fetching

      const newPrices = {
        gold18k: generateRandomPrice(18200000, 18850000),
        goldBuy: generateRandomPrice(17900000, 18550000),
        goldExchange: generateRandomPrice(18100000, 18650000),
        coinQuarter: generateRandomPrice(49000000, 53000000),
        coinHalf: generateRandomPrice(92000000, 93000000),
        coinFull: generateRandomPrice(174000000, 176000000),
        coinEmami: generateRandomPrice(178000000, 179900000),
      };

      const savedPrice = await priceRepository.create(newPrices);

      pricesNamespace.emit("livePricesUpdate", savedPrice);
    } catch (err) {
      logger.error("Error in price cron job:", err);
    }
  });
};