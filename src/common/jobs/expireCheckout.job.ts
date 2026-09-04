import cron from "node-cron";
import { CheckoutRepository } from "../../modules/Checkout/checkout.repository";
import logger from "../utils/logger";

const checkoutRepository = new CheckoutRepository();

const markExpiredPendingCheckouts = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const updatedCount = await checkoutRepository.markExpired(thirtyMinutesAgo);

    logger.info(
      `Expired checkouts marked successfully. Updated count: ${updatedCount}`,
    );
  } catch (err) {
    logger.error("Cant mark expired checkouts", err);
  }
};

export const startCheckoutExpirationCronJob = () => {
  markExpiredPendingCheckouts();

  cron.schedule("*/5 * * * *", markExpiredPendingCheckouts);
};
