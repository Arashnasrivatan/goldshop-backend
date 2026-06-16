/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, NextFunction, Response } from "express";
import { ObjectSchema, ValidationError } from "yup";
import { AppError } from "../errors/AppError";

type ValidationType = "body" | "params" | "query";

declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}

const validate =
  (validator: ObjectSchema<any>, type: ValidationType = "body") =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let dataToValidate: any;
      switch (type) {
        case "params":
          dataToValidate = req.params;
          break;
        case "query":
          dataToValidate = req.query;
          break;
        case "body":
        default:
          dataToValidate = req.body;
          break;
      }

      const validatedData = await validator.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
      });

      req.validatedData = validatedData;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new AppError("Validation error", 422, err.errors);
      }

      next(err);
    }
  };

export default validate;
