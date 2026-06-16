import { Response } from "express";
import { IApiResponse } from "./../types/response";

const response = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
): Response => {
  const responseObject: IApiResponse = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data: null,
  };

  if (data !== undefined) {
    responseObject.data = data;
  }

  return res.status(statusCode).json(responseObject);
};

export default response;
