import { Request, Response, NextFunction } from "express";
import configs from "../../configs/env.config";

export const setHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", configs.app.cors);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
};
