import { useState, useEffect, useMemo } from "react";
import {
  Map as KakaoMap,
  CustomOverlayMap,
  MapMarker,
  Polyline,
} from "react-kakao-maps-sdk";
import SearchBar from "../../components/main/SearchBar";
import PlaceDetailSheet from "../../components/main/PlaceDetailSheet";
import placeApi from "../../api/place/place.api";
import routeApi from "../../api/route/route.api";
import type {
  PlaceDetail,
  RecommendRequest,
  Category,
} from "../../types/place/place.type";
import type { RoutePoint } from "../../types/route/route.type";
import { debounce } from "lodash";
import { LocateFixed } from "lucide-react";

const MainPage = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.528086,
    lng: 126.917917,
  });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.528086,
    lng: 126.917917,
  });
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);
  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [, setIsLoadingPlaces] = useState(false);

  console.log(userLocation.lat, userLocation.lng)

  useEffect(() => {
    // 사용자 위치 가져오기
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          setMapCenter(location);
          setIsLocationLoaded(true);
          // 위치를 가져온 후 주변 장소 로드
          loadNearbyPlaces(latitude, longitude);
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          setIsLocationLoaded(true); // 실패해도 기본 위치로 표시
          // 기본 위치로 주변 장소 로드
          loadNearbyPlaces(37.528086, 126.917917);
        }
      );
    } else {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.");
      setIsLocationLoaded(true);
      loadNearbyPlaces(37.528086, 126.917917);
    }
  }, []);

  const loadNearbyPlaces = async (
    lat: number,
    lng: number,
    radiusKm: number = 5
  ) => {
    setIsLoadingPlaces(true);
    try {
      const nearbyPlaces = await placeApi.getNearbyPlaces(lat, lng, radiusKm);
      setPlaces(nearbyPlaces);
    } catch (error) {
      console.error("주변 장소 조회 실패:", error);
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const recommendPlaces = async (category: RecommendRequest["category"]) => {
    setIsLoadingPlaces(true);
    setSelectedPlace(null);
    setRoutePoints([]);
    try {
      await placeApi.loadPlacesData(userLocation.lat, userLocation.lng, 20)
      const recommended = await placeApi.getPlacesByCategory(category, userLocation.lat, userLocation.lng)
      setPlaces(sortByDistance(recommended));
    } catch (error) {
      console.error("추천 장소 조회 실패:", error);
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 거리순 정렬 함수
  const sortByDistance = (places: PlaceDetail[]): PlaceDetail[] => {
    return places.sort((a, b) => {
      const distA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      );
      const distB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      );
      return distA - distB;
    });
  };

  const handleSearch = async (query: string, category?: string) => {
    setIsLoadingPlaces(true);
    setSelectedPlace(null);
    setRoutePoints([]);

    try {
      let results: PlaceDetail[] = [];

      // 카테고리만 선택한 경우
      if (category && !query) {
        results = await placeApi.getPlacesByCategory(
          category as Category,
          userLocation.lat,
          userLocation.lng
        );
      }
      // 검색어만 입력한 경우 - 주변 장소 중에서 필터링
      else if (query && !category) {
        const nearbyPlaces = await placeApi.getNearbyPlaces(
          userLocation.lat,
          userLocation.lng,
          50
        );
        // 클라이언트 사이드에서 검색어로 필터링
        results = nearbyPlaces.filter(
          (place) =>
            place.name.toLowerCase().includes(query.toLowerCase()) ||
            (place.address?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
            (place.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
        );
      }
      // 카테고리 + 검색어 모두 입력한 경우
      else if (query && category) {
        const categoryPlaces = await placeApi.getPlacesByCategory(
          category as Category,
          userLocation.lat,
          userLocation.lng
        );
        // 카테고리 결과에서 검색어로 필터링
        results = categoryPlaces.filter(
          (place) =>
            place.name.toLowerCase().includes(query.toLowerCase()) ||
            (place.address?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
            (place.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
        );
      }
      // 아무것도 없으면 주변 장소 표시
      else {
        await loadNearbyPlaces(userLocation.lat, userLocation.lng);
        return; // loadNearbyPlaces가 setPlaces를 호출하므로 여기서 return
      }

      // 거리순으로 정렬 후 설정
      setPlaces(sortByDistance(results));
    } catch (error) {
      console.error("검색 실패:", error);
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handlePlaceClick = async (place: PlaceDetail) => {
    setSelectedPlace(place);
    setIsLoadingRoute(true);
    // 지도 중심을 선택한 장소로 이동
    setMapCenter({ lat: place.latitude, lng: place.longitude });

    try {
      // 사용자 위치에서 선택한 장소까지의 경로 가져오기
      const route = await routeApi.getAccessibleRoute(
        userLocation.lat,
        userLocation.lng,
        place.latitude,
        place.longitude
      );
      setRoutePoints(route.routePoint);
    } catch (error) {
      console.error("경로 조회 실패:", error);
      setRoutePoints([]);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleFilterClick = async (filterType: string) => {
    setIsLoadingPlaces(true);
    setSelectedPlace(null);
    setRoutePoints([]);

    try {
      switch (filterType) {
        case "wheelchair": {
          const wheelchairPlaces = await placeApi.getWheelchairAccessiblePlaces(
            userLocation.lat,
            userLocation.lng
          );
          // 거리순 정렬
          setPlaces(sortByDistance(wheelchairPlaces));
          break;
        }
        case "nearby": {
          await loadNearbyPlaces(userLocation.lat, userLocation.lng, 2);
          // 지도 중심을 사용자 위치로 복귀
          setMapCenter(userLocation);
          break;
        }
        case "highAccessibility": {
          const highAccessibilityPlaces =
            await placeApi.getHighAccessibilityPlaces(
              80,
              userLocation.lat,
              userLocation.lng
            );
          // 거리순 정렬
          setPlaces(sortByDistance(highAccessibilityPlaces));
          break;
        }
      }
    } catch (error) {
      console.error("필터 적용 실패:", error);
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // 지도의 중심을 유저의 현재 위치로 변경
  const setCenterToMyPosition = () => {
    setMapCenter(userLocation);
  };

  // 지도 중심좌표 이동 감지 시 이동된 중심좌표로 설정
  const updateCenterWhenMapMoved = useMemo(
    () =>
      debounce((map: kakao.maps.Map) => {
        setMapCenter({
          lat: map.getCenter().getLat(),
          lng: map.getCenter().getLng(),
        });
      }, 500),
    []
  );

  if (!isLocationLoaded) {
    return (
      <div className="relative w-full h-full min-h-screen flex items-center justify-center">
        <p className="text-gray-600">위치 정보를 가져오는 중...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen">
      <KakaoMap
        center={mapCenter}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        level={3}
        onCenterChanged={updateCenterWhenMapMoved}
      >
        {/* 사용자 현재 위치 - 파란색 원 */}
        <CustomOverlayMap position={userLocation}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#4285F4",
              border: "3px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              transform: "translate(-50%, -50%)",
            }}
          />
        </CustomOverlayMap>

        {/* 장소 마커들 */}
        {places.map((place, index) => (
          <MapMarker
            key={place.id ? `place-${place.id}` : `place-idx-${index}`}
            position={{ lat: place.latitude, lng: place.longitude }}
            onClick={() => handlePlaceClick(place)}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              size: { width: 24, height: 35 },
            }}
          />
        ))}

        {/* 경로 표시 */}
        {routePoints.length > 0 && (
          <Polyline
            path={routePoints.map((point) => ({
              lat: point.lat,
              lng: point.lng,
            }))}
            strokeWeight={5}
            strokeColor="#4285F4"
            strokeOpacity={0.7}
            strokeStyle="solid"
          />
        )}
      </KakaoMap>

      <div className="absolute top-4 left-4 right-4 z-10">
        <SearchBar
          onSearch={handleSearch}
          onFilterClick={handleFilterClick}
          onCategorySelectAndRecommend={recommendPlaces}
        />
      </div>

      <div className="flex flex-col gap-2.5 absolute z-1 top-[100px] right-0 p-2.5">
        <button
          className="flex justify-center items-center cursor-pointer rounded-full w-[45px] h-[45px] bg-white shadow-[0_0_8px_#00000025]"
          onClick={setCenterToMyPosition}
        >
          <LocateFixed width={25} height={25} />
        </button>
      </div>

      {/* 로딩 인디케이터
      {isLoadingPlaces && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-lg shadow-lg z-10">
          <p className="text-gray-700">장소를 검색하는 중...</p>
        </div>
      )} */}

      {/* 검색 결과 없음
      {!isLoadingPlaces && places.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-lg shadow-lg z-10">
          <p className="text-gray-700">검색 결과가 없습니다.</p>
          <button
            onClick={() => loadNearbyPlaces(userLocation.lat, userLocation.lng)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            주변 장소 보기
          </button>
        </div>
      )} */}

      {/* 장소 상세 정보 하단 시트 */}
      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          onClose={() => {
            setSelectedPlace(null);
            setRoutePoints([]);
          }}
          isLoadingRoute={isLoadingRoute}
        />
      )}
    </div>
  );
};

export default MainPage;
