import cron from "node-cron";
import { socketManager } from "../../configs/socket.config";
import { PriceRepository } from "../../modules/Price/price.repository";
import { PriceStatusService } from "../../modules/Price/priceStatus.service";
import logger from "../utils/logger";
import configs from "../../configs/env.config";

const priceRepository = new PriceRepository();

const generateRandomPrice = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const fetchPriceFromApi = async () => {
  // TODO: Replace with real API endpoint

  const isHealthy = Math.random() > 0.2;
  if (!isHealthy) {
    throw new Error("External price API unreachable");
  }

  return {
    gold18k: generateRandomPrice(18200000, 18850000),
    goldBuy: generateRandomPrice(17900000, 18550000),
    goldExchange: generateRandomPrice(18100000, 18650000),
    coinQuarter: generateRandomPrice(49000000, 53000000),
    coinHalf: generateRandomPrice(92000000, 93000000),
    coinFull: generateRandomPrice(174000000, 176000000),
    coinEmami: generateRandomPrice(178000000, 179900000),
  };
};

export const startPriceCronJob = () => {
  const pricesNamespace = socketManager.getNamespace("/prices");

  pricesNamespace.on("connection", async (socket) => {
    try {
      const status = PriceStatusService.isPriceDisplayAllowed();

      if (!status.allowed) {
        socket.emit("livePricesUpdate", {
          isAvailable: false,
          message: status.message,
          data: null,
        });
        return;
      }

      const latestPrice = await priceRepository.findLatest();
      if (latestPrice) {
        socket.emit("livePricesUpdate", {
          isAvailable: true,
          data: latestPrice,
        });
      }
    } catch (err) {
      logger.error("Error sending initial socket price status:", err);
    }
  });

  cron.schedule("* * * * *", async () => {
    try {
      if (!PriceStatusService.isMarketOpen()) {
        pricesNamespace.emit("livePricesUpdate", {
          isAvailable: false,
          message: `Market is currently closed. Operating hours are ${configs.price.startHour}:00 to ${configs.price.endHour}:00.`,
          data: null,
        });
        return;
      }

      const newPrices = await fetchPriceFromApi();
      PriceStatusService.recordSuccess();
      const savedPrice = await priceRepository.create(newPrices);

      pricesNamespace.emit("livePricesUpdate", {
        isAvailable: true,
        data: savedPrice,
      });
    } catch (err) {
      const failureCount = PriceStatusService.recordFailure();
      logger.error(`API fetch error (Failure count: ${failureCount}/5):`, err);

      const status = PriceStatusService.isPriceDisplayAllowed();
      if (!status.allowed) {
        pricesNamespace.emit("livePricesUpdate", {
          isAvailable: false,
          message: status.message,
          data: null,
        });
      }
    }
  });
};
