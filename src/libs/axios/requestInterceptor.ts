import { type InternalAxiosRequestConfig } from "axios";
import token from "../token/token";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  REQUEST_TOKEN_KEY,
} from "../../constants/token.constants";

const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  if (typeof window !== "undefined") {
    // 토큰이 필요 없는 경로들
    const publicPaths = ["/users/login", "/users/register", "/users/refresh"];
    const isPublicPath = publicPaths.some((path) => config.url?.includes(path));

    if (!isPublicPath) {
      const accessToken = token.getToken(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        console.error("Access token not found.");
        // 현재 페이지가 이미 로그인 페이지가 아닌 경우에만 리다이렉트
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else {
        config.headers[REQUEST_TOKEN_KEY] = `Bearer ${accessToken}`;
      }
    }
  }
  return config;
};

export default requestInterceptor;
