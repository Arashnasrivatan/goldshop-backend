import { startDeletePriceCronJob } from "./deletePrice.job";
import { startCheckoutExpirationCronJob } from "./expireCheckout.job";
import { startPriceCronJob } from "./price.job";

const startCronJobs = () => {
  startPriceCronJob();
  startDeletePriceCronJob();
  startCheckoutExpirationCronJob();
};

export default startCronJobs;
