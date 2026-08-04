import { Router, Request, Response } from "express";
import os from "os";
import configs from "../configs/env.config";
import response from "../common/utils/response";
import AuthRouter from "./Auth/auth.route";
import BanRouter from "./Ban/ban.route";
import UserRouter from "./User/user.route";
import CategoryRouter from "./Category/category.route";
import PriceRouter from "./Price/price.route";
import ProductRouter from "./Product/product.route";

const apiRouter: Router = Router();

//* Health Check Route
apiRouter.get("/api/status", (req: Request, res: Response) => {
  const start = process.hrtime.bigint();

  const isDev = configs.app.env === "development";

  const data = {
    ping: "0 ms",
    uptime: `${Math.floor(process.uptime() / 60)}m`,
    serverTime: new Date().toISOString(),
  };

  if (isDev) {
    const memoryUsage = process.memoryUsage();

    Object.assign(data, {
      environment: configs.app.env,
      nodeVersion: process.version,
      platform: os.platform(),
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  }

  const end = process.hrtime.bigint();
  data.ping = `${(Number(end - start) / 1_000_000).toFixed(2)} ms`;

  return response(res, 200, "🚀 Server is up and running", data);
});

// TODO: modules routes
apiRouter.use("/api/auth", AuthRouter);
apiRouter.use("/api/bans", BanRouter);
apiRouter.use("/api/users", UserRouter);
apiRouter.use("/api/categories", CategoryRouter);
apiRouter.use("/api/prices", PriceRouter);
apiRouter.use("/api/products", ProductRouter);

export default apiRouter;
