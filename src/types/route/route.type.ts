export interface RoutePoint {
  lat: number;
  lng: number;
  elevation: number;
  slope: number;
}

export interface RouteResponse {
  routePoint: RoutePoint[];
}
