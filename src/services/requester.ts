import api from "./api";
import type { AxiosResponse } from "axios";

interface RequestStore {
  loading: boolean;
  error: string | null;
}

type RequestFunction = () => Promise<AxiosResponse>;
type SuccessCallback = (response: AxiosResponse) => void;

export async function handleRequest<T>(
  requestFn: RequestFunction,
  store: RequestStore,
  successCallback: SuccessCallback | null = null
): Promise<T | undefined> {
  store.loading = true;
  store.error = null;

  try {
    const response = await requestFn();

    if (successCallback) {
      successCallback(response);
    }

    return response.data;
  } catch (error: any) {
    const errorMessage = (store.error =
      error.response?.data?.message || "An error occurred");
    store.error = errorMessage;
    throw new Error(errorMessage);
  } finally {
    store.loading = false;
  }
}

export const apiService = {
  get: <T>(url: string, params = {}): Promise<AxiosResponse<T>> =>
    api.get<T>(url, { params }),

  post: <T>(url: string, data = {}): Promise<AxiosResponse<T>> =>
    api.post<T>(url, data),

  put: <T>(url: string, data = {}): Promise<AxiosResponse<T>> =>
    api.put<T>(url, data),

  delete: <T>(url: string): Promise<AxiosResponse<T>> => api.delete<T>(url),
};
