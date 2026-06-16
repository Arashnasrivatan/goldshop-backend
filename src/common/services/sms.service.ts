import configs from "./../../configs/env.config";
import axios from "axios";

interface SmsParameters {
  name: string;
  value: string | number;
}

export interface SmsResponse {
  status: number;
  message: string;
  data?: Record<string, unknown>;
}

const sendSms = async (
  phone: string,
  parameters: SmsParameters[],
  templateId: string = configs.sms.pattern
): Promise<SmsResponse> => {
  try {
    const requestData = {
      mobile: phone,
      templateId: templateId,
      parameters: parameters,
    };

    const response = await axios.post(configs.sms.baseUrl, requestData, {
      headers: {
        "x-api-key": configs.sms.apiKey,
        "Content-Type": "application/json",
      },
    });

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
      message: err instanceof Error ? err.message : "An unknown error occurred",
    };
  }
};

export { sendSms };
