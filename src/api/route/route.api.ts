import customAxios from "../../libs/axios/customAxios";
import type { RouteResponse } from "../../types/route/route.type";

class RouteApi {
  /**
   * 휠체어 접근 가능한 경로 조회
   * GET /api/route
   */
  public async getAccessibleRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<RouteResponse> {
    const response = await customAxios.get<RouteResponse>("/route", {
      params: {
        startLat,
        startLng,
        endLat,
        endLng,
      },
    });
    return response.data;
  }
}

export default new RouteApi();