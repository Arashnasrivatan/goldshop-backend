import axios from "axios";
import configs from "./../../configs/env.config";

export interface SmsParameter {
  name: string;
  value: string | number;
}

export interface SmsResponse {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

class SmsService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultTemplateId: string;

  constructor() {
    this.apiKey = configs.sms.apiKey;
    this.baseUrl = configs.sms.baseUrl;
    this.defaultTemplateId = configs.sms.pattern;
  }

  async send(
    phone: string,
    parameters: SmsParameter[],
    templateId: string = this.defaultTemplateId,
  ): Promise<SmsResponse> {
    try {
      const requestData = {
        mobile: phone,
        templateId,
        parameters,
      };

      const response = await axios.post<SmsResponse>(
        this.baseUrl,
        requestData,
        {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return {
          status: err.response?.status || 500,
          message: err.response?.data?.message || err.message,
        };
      }

      return {
        status: 500,
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
      };
    }
  }
}

export const smsService = new SmsService();
