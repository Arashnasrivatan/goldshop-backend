import { startDeletePriceCronJob } from "./deletePrice.job";
import { startPriceCronJob } from "./price.job";

const startCronJobs = () => {
  startDeletePriceCronJob();
  startPriceCronJob();
};

export default startCronJobs;
