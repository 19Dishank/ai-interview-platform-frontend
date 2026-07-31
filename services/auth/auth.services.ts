import { SendOtpBody } from "@/app/api/auth/send-otp/route";
import { clientApi } from "../api/client-axios";
import { VerifyOtpBody } from "@/app/api/auth/verify-otp/route";

export const sendOTP = async (payload: SendOtpBody) => {
  try {
    const response = await clientApi.post("/auth/send-otp", payload);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const verifyOTP = async (payload: VerifyOtpBody) => {
  try {
    const response = await clientApi.post("/auth/verify-otp", payload);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await clientApi.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
