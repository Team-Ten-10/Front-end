import customAxios from "../../libs/axios/customAxios";

// 카테고리 타입
type Category =
  | "PARK"
  | "MUSEUM"
  | "CAFE"
  | "RESTAURANT"
  | "SHOPPING_MALL"
  | "LIBRARY"
  | "THEATER"
  | "TOURIST_SPOT"
  | "SPORTS_CENTER"
  | "ART_GALLERY";

// 접근성 정보 인터페이스
interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasElevator: boolean;
  hasAccessibleParking: boolean;
  hasAccessibleRestroom: boolean;
  hasRamp: boolean;
  hasAutomaticDoor: boolean;
  hasBrailleBlock: boolean;
  accessibilityDescription: string;
  accessibilityScore: number;
}

// 장소 상세 정보 인터페이스
interface PlaceDetail {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: Category;
  categoryDisplayName: string;
  contactNumber: string;
  website: string;
  operatingHours: string;
  accessibilityInfo: AccessibilityInfo;
}

// 간단한 장소 정보 인터페이스 (추천용)
interface PlaceSimple {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

// 장소 추천 요청 인터페이스
interface RecommendRequest {
  category: Category;
  latitude: number; // -90 ~ 90
  longitude: number; // -180 ~ 180
  radiusKm: number; // 1 ~ 50
  minAccessibilityScore: number; // 0 ~ 100
}

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
