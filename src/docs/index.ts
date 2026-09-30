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
  },
  components: {
    ...base.components,
    schemas: {
      ...base.components.schemas,
      ...authComponents.schemas,
      ...userComponents.schemas,
      ...banComponents.schemas,
    },
    responses: {
      ...authComponents.responses,
      ...userComponents.responses,
      ...banComponents.responses,
    },
    parameters: { ...userComponents.parameters, ...banComponents.parameters },
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
