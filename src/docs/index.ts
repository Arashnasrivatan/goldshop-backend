import { Router, RequestHandler } from "express";
import helmet from "helmet";
import base from "./openapi.json";
import systemPaths from "./paths/system.json";
import authPaths from "./paths/auth.json";
import authComponents from "./components/auth.json";
import userSelfPaths from "./paths/users-self.json";
import userAdminPaths from "./paths/users-admin.json";
import userComponents from "./components/users.json";
import banPaths from "./paths/bans.json";
import banComponents from "./components/bans.json";
import categoryPaths from "./paths/categories.json";
import categoryComponents from "./components/categories.json";
import pricePaths from "./paths/prices.json";
import priceComponents from "./components/prices.json";
import productPaths from "./paths/products.json";
import productComponents from "./components/products.json";
import cartPaths from "./paths/carts.json";
import cartComponents from "./components/carts.json";
import shippingPaths from "./paths/shipping-methods.json";
import shippingComponents from "./components/shipping-methods.json";
import checkoutPaths from "./paths/checkouts.json";
import checkoutComponents from "./components/checkouts.json";
import orderPaths from "./paths/orders.json";
import orderComponents from "./components/orders.json";
import dashboardPaths from "./paths/dashboard.json";
import dashboardComponents from "./components/dashboard.json";
import storeSettingsPaths from "./paths/store-settings.json";
import storeSettingsComponents from "./components/store-settings.json";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const swaggerUi = require("swagger-ui-express") as {
  serve: RequestHandler[];
  setup: (document?: object, options?: object) => RequestHandler;
};

const router = Router();
const document = {
  ...base,
  paths: {
    ...systemPaths,
    ...authPaths,
    ...userSelfPaths,
    ...userAdminPaths,
    ...banPaths,
    ...categoryPaths,
    ...pricePaths,
    ...productPaths,
    ...cartPaths,
    ...shippingPaths,
    ...checkoutPaths,
    ...orderPaths,
    ...dashboardPaths,
    ...storeSettingsPaths,
  },
  components: {
    ...base.components,
    schemas: {
      ...base.components.schemas,
      ...authComponents.schemas,
      ...userComponents.schemas,
      ...banComponents.schemas,
      ...categoryComponents.schemas,
      ...priceComponents.schemas,
      ...productComponents.schemas,
      ...cartComponents.schemas,
      ...shippingComponents.schemas,
      ...checkoutComponents.schemas,
      ...orderComponents.schemas,
      ...dashboardComponents.schemas,
      ...storeSettingsComponents.schemas,
    },
    responses: {
      ...authComponents.responses,
      ...userComponents.responses,
      ...banComponents.responses,
      ...categoryComponents.responses,
      ...priceComponents.responses,
      ...productComponents.responses,
      ...cartComponents.responses,
      ...shippingComponents.responses,
      ...checkoutComponents.responses,
      ...orderComponents.responses,
      ...dashboardComponents.responses,
      ...storeSettingsComponents.responses,
    },
    parameters: {
      ...userComponents.parameters,
      ...banComponents.parameters,
      ...categoryComponents.parameters,
      ...productComponents.parameters,
      ...shippingComponents.parameters,
      ...orderComponents.parameters,
    },
  },
};

router.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      upgradeInsecureRequests: null,
    },
  }),
);

router.get("/openapi.json", (_req, res) => res.json(document));
router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    customSiteTitle: "GoldShop API Docs",
    swaggerOptions: { url: "/api/docs/openapi.json", validatorUrl: null },
  }),
);

export default router;
