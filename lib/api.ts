import axios, { isAxiosError } from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: `${API_URL}/v1/`,
  withCredentials: true,
});

export const handler = async (fn: Function) => {
  try {
    const { data } = await fn();

    return data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      return err.response?.data?.message;
    } else if (err instanceof Error) {
      return err.message;
    } else {
      return "Something went wrong";
    }
  }
};

export default api;
