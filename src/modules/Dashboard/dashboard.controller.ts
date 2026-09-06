import { NextFunction, Request, Response } from "express";
import response from "../../common/utils/response";
import { DashboardService } from "./dashboard.service";
import { GetDashboardDto } from "./dto/getDashboard.dto";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = new GetDashboardDto(req.validatedData ?? req.query);
      const result = await this.dashboardService.getDashboard(input);

      return response(res, 200, "Dashboard fetched successfully", result);
    } catch (error) {
      next(error);
    }
  };
}
