import cron from "node-cron";
import { socketManager } from "../../configs/socket.config";
import { PriceRepository } from "../../modules/Price/price.repository";
import { PriceStatusService } from "../../modules/Price/priceStatus.service";
import logger from "../utils/logger";
import configs from "../../configs/env.config";

const priceRepository = new PriceRepository();

let currentPrices = {
  gold18k: 18450000,
  goldBuy: 18200000,
  goldExchange: 18300000,
  coinQuarter: 51000000,
  coinHalf: 92500000,
  coinFull: 175000000,
  coinEmami: 179000000,
};

const fluctuatePrice = (currentPrice: number, maxChange: number) => {
  const randomFactor = Math.random() * 2 - 1;
  const change = Math.floor(randomFactor * maxChange);
  const newPrice = currentPrice + change;
  const rounded = Math.round(newPrice / 1000) * 1000;
  return { newPrice, rounded };
};

const fetchPriceFromApi = async () => {
  // TODO: Replace with real API endpoint

  const isHealthy = Math.random() > 0.2;
  if (!isHealthy) {
    throw new Error("External price API unreachable");
  }

  const GOLD_MAX_CHANGE = 50000;
  const COIN_MAX_CHANGE = 200000;

  currentPrices = {
    gold18k: fluctuatePrice(currentPrices.gold18k, GOLD_MAX_CHANGE).rounded,
    goldBuy: fluctuatePrice(currentPrices.goldBuy, GOLD_MAX_CHANGE).rounded,
    goldExchange: fluctuatePrice(currentPrices.goldExchange, GOLD_MAX_CHANGE)
      .rounded,

    coinQuarter: fluctuatePrice(currentPrices.coinQuarter, COIN_MAX_CHANGE)
      .rounded,
    coinHalf: fluctuatePrice(currentPrices.coinHalf, COIN_MAX_CHANGE).rounded,
    coinFull: fluctuatePrice(currentPrices.coinFull, COIN_MAX_CHANGE).rounded,
    coinEmami: fluctuatePrice(currentPrices.coinEmami, COIN_MAX_CHANGE).rounded,
  };

  return { ...currentPrices };
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
          message: `Market is currently closed. Operating hours are ${configs.price.startTime} to ${configs.price.endTime}.`,
          data: null,
        });
        return;
      }

      const newPrices = await fetchPriceFromApi();
      PriceStatusService.recordSuccess();
      const savedPrice = await priceRepository.create(newPrices);

      logger.info("Prices updated");

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
