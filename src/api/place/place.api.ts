import customAxios from "../../libs/axios/customAxios";
import type {
  Category,
  PlaceDetail,
  PlaceSimple,
  RecommendRequest,
} from "../../types/place/place.type";

class PlaceApi {
  /**
   * 맞춤형 장소 추천
   * POST /api/places/recommend
   */
  public async recommendPlaces(data: RecommendRequest): Promise<PlaceSimple[]> {
    const response = await customAxios.post<PlaceSimple[]>(
      "/api/places/recommend",
      data
    );
    return response.data;
  }

  /**
   * 모든 휠체어 접근 가능 장소 조회
   * GET /api/places/wheelchair-accessible
   */
  public async getWheelchairAccessiblePlaces(): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/wheelchair-accessible"
    );
    return response.data;
  }

  /**
   * 카테고리별 휠체어 접근 가능 장소 조회
   * GET /api/places/wheelchair-accessible/category/{category}
   */
  public async getPlacesByCategory(category: Category): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      `/api/places/wheelchair-accessible/category/${category}`
    );
    return response.data;
  }

  /**
   * 주변 휠체어 접근 가능 장소 조회
   * GET /api/places/nearby
   */
  public async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/nearby",
      {
        params: {
          latitude,
          longitude,
          radiusKm,
        },
      }
    );
    return response.data;
  }

  /**
   * 높은 접근성 점수 장소 조회
   * GET /api/places/high-accessibility
   */
  public async getHighAccessibilityPlaces(
    minScore: number = 70
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/high-accessibility",
      {
        params: {
          minScore,
        },
      }
    );
    return response.data;
  }
}

export default new PlaceApi();
