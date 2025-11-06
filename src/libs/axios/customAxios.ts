import axios, { type CreateAxiosDefaults } from "axios";
import requestInterceptor from "./requestInterceptor";
import ResponseHandler from "./responseInterceptor";
import { REQUEST_TOKEN_KEY } from "../../constants/token.constants";
import { SERVER_URL } from "../../constants/server.constants";

const axiosRequestConfig: CreateAxiosDefaults = {
  baseURL: SERVER_URL,
  withCredentials: true,
};

const customAxios = axios.create(axiosRequestConfig);

customAxios.interceptors.request.use(requestInterceptor as any, (err) => Promise.reject(err));

customAxios.interceptors.response.use((res) => res, ResponseHandler);

export default customAxios;

export const setAccessToken = (token: string) => {
  customAxios.defaults.headers[REQUEST_TOKEN_KEY] = `Bearer ${token}`;
};
