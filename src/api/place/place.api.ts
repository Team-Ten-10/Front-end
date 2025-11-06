import customAxios from "../../libs/axios/customAxios";
import type {
  Category,
  PlaceDetail,
  PlaceSimple,
  RecommendRequest,
  AIRecommendRequest,
  AIRecommendResponse,
  LoadDataResponse,
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
   * AI 기반 장소 추천
   * POST /api/places/recommend/ai
   */
  public async recommendPlacesWithAI(
    data: AIRecommendRequest
  ): Promise<AIRecommendResponse> {
    const response = await customAxios.post<AIRecommendResponse>(
      "/api/places/recommend/ai",
      data
    );
    return response.data;
  }

  /**
   * 모든 휠체어 접근 가능 장소 조회
   * GET /api/places/wheelchair-accessible
   */
  public async getWheelchairAccessiblePlaces(
    latitude: number,
    longitude: number
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/wheelchair-accessible",
      {
        params: {
          latitude,
          longitude,
        },
      }
    );
    return response.data;
  }

  /**
   * 카테고리별 휠체어 접근 가능 장소 조회
   * GET /api/places/wheelchair-accessible/category/{category}
   */
  public async getPlacesByCategory(
    category: Category,
    latitude: number,
    longitude: number
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      `/api/places/wheelchair-accessible/category/${category}`,
      {
        params: {
          latitude,
          longitude,
        },
      }
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
    minScore: number = 70,
    latitude: number,
    longitude: number
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/high-accessibility",
      {
        params: {
          minScore,
          latitude,
          longitude,
        },
      }
    );
    return response.data;
  }

  /**
   * 특정 위치 주변 장소 데이터 로드
   * GET /api/places/load-data
   */
  public async loadPlacesData(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<LoadDataResponse> {
    const response = await customAxios.get<LoadDataResponse>(
      "/api/places/load-data",
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
   * 장애인 화장실 있는 장소 조회
   * GET /api/places/accessible-restroom
   */
  public async getAccessibleRestroomPlaces(
    latitude: number,
    longitude: number
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/accessible-restroom",
      {
        params: {
          latitude,
          longitude,
        },
      }
    );
    return response.data;
  }

  /**
   * 장애인 주차장 있는 장소 조회
   * GET /api/places/accessible-parking
   */
  public async getAccessibleParkingPlaces(
    latitude: number,
    longitude: number
  ): Promise<PlaceDetail[]> {
    const response = await customAxios.get<PlaceDetail[]>(
      "/api/places/accessible-parking",
      {
        params: {
          latitude,
          longitude,
        },
      }
    );
    return response.data;
  }
}

export default new PlaceApi();
