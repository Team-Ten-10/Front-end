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