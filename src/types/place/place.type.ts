// 카테고리 타입
export type Category =
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
export interface AccessibilityInfo {
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
export interface PlaceDetail {
  id?: number;
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: Category;
  categoryDisplayName?: string;
  contactNumber?: string;
  website?: string;
  operatingHours?: string;
  accessibilityInfo?: AccessibilityInfo;
  accessibilityScore?: number; // 서버에서 직접 점수만 올 수도 있음
}

// 간단한 장소 정보 인터페이스 (추천용)
export interface PlaceSimple {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

// 장소 추천 요청 인터페이스
export interface RecommendRequest {
  category: Category;
  latitude: number; // -90 ~ 90
  longitude: number; // -180 ~ 180
  radiusKm: number; // 1 ~ 50
  minAccessibilityScore: number; // 0 ~ 100
}

// AI 기반 장소 추천 요청 인터페이스
export interface AIRecommendRequest {
  userRequest: string;
  category: Category;
  latitude: number; // -90 ~ 90
  longitude: number; // -180 ~ 180
  radiusKm: number; // 1 ~ 50
  minAccessibilityScore: number; // 0 ~ 100
}

// AI 추천 장소 정보
export interface AIRecommendedPlace {
  placeId: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  accessibilityScore: number;
  recommendationReason: string;
}

// AI 기반 장소 추천 응답 인터페이스
export interface AIRecommendResponse {
  aiSummary: string;
  recommendedPlaces: AIRecommendedPlace[];
}

// 데이터 로드 응답 인터페이스
export interface LoadDataResponse {
  message: string;
  savedCount: number;
  latitude: number;
  longitude: number;
  radiusKm: number;
}