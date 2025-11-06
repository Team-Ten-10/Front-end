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
import "./loading.css";
import LoadingEffect from "../../components/common/LoadingEffect";
import wheelChairImg from "../../assets/wheelChair.png";
import restroomIcon from "../../assets/icons/restroom.svg";

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
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 길찾기 입력 상태 추가
  const [startInput, setStartInput] = useState<string>(
    `${userLocation.lat},${userLocation.lng}`
  );
  const [endInput, setEndInput] = useState<string>("");

  // 도착 자동완성 상태
  const [endSuggestions, setEndSuggestions] = useState<PlaceDetail[]>([]);
  const [endSelectedPlace, setEndSelectedPlace] = useState<PlaceDetail | null>(
    null
  );
  const [isEndSuggestLoading, setIsEndSuggestLoading] = useState(false);

  // 좌표 문자열(예: "37.5665,126.978")을 파싱하는 유틸
  const parseCoordString = (
    input: string
  ): { lat: number; lng: number } | null => {
    if (!input) return null;
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length !== 2) return null;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  // 서버에 쿼리파라미터(GET)로 요청을 보내는 헬퍼
  const fetchAccessibleRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ) => {
    return await routeApi.getAccessibleRoute(
      startLat,
      startLng,
      endLat,
      endLng
    );
  };

  // 입력된 출발/도착 좌표로 경로 조회
  const handleRouteSearch = async () => {
    setIsLoadingRoute(true);
    setSelectedPlace(null); // 장소 선택 초기화
    try {
      // 출발 처리: 좌표 문자열 우선
      const start = parseCoordString(startInput);
      if (!start) {
        console.error(
          "출발 좌표 형식이 잘못되었습니다. 'lat,lng' 형태로 입력하세요."
        );
        setRoutePoints([]);
        return;
      }

      // 도착 처리 우선순위:
      // 1) 사용자가 제안에서 선택한 장소(endSelectedPlace)와 이름이 일치하면 그 좌표 사용
      // 2) endInput이 좌표 문자열이면 파싱해서 사용
      // 3) 그 외에는 주변 장소에서 이름으로 찾아 첫 결과 사용
      let endCoords = null;
      if (endSelectedPlace && endSelectedPlace.name === endInput) {
        endCoords = {
          lat: endSelectedPlace.latitude,
          lng: endSelectedPlace.longitude,
        };
      } else {
        const parsedEnd = parseCoordString(endInput);
        if (parsedEnd) {
          endCoords = parsedEnd;
        } else {
          // 이름 검색으로 시도(주변 반경 크게 설정)
          if (userLocation) {
            const candidates = await placeApi.getNearbyPlaces(
              userLocation.lat,
              userLocation.lng,
              50
            );
            const matched = candidates.find(
              (p) =>
                p.name.toLowerCase() === endInput.toLowerCase() ||
                p.name.toLowerCase().includes(endInput.toLowerCase())
            );
            if (matched) {
              endCoords = { lat: matched.latitude, lng: matched.longitude };
              // 선택 정보 갱신
              setEndSelectedPlace(matched);
            }
          }
        }
      }

      if (!endCoords) {
        console.error(
          "도착 좌표를 찾을 수 없습니다. 이름 또는 'lat,lng' 형식으로 입력하세요."
        );
        setRoutePoints([]);
        return;
      }

      // 지도 중심을 출발지로 이동
      setMapCenter(start);

      // 서버에 GET 쿼리로 요청 전송
      const route = await fetchAccessibleRoute(
        start.lat,
        start.lng,
        endCoords.lat,
        endCoords.lng
      );
      setRoutePoints(route.routePoint ?? []);
    } catch (error) {
      console.error("경로 조회 실패:", error);
      setRoutePoints([]);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setRoutePoints([]);
    setEndInput("");
    setEndSuggestions([]);
    setEndSelectedPlace(null);
  };

  useEffect(() => {
    // 사용자 위치 가져오기
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          setMapCenter(location);
          // 위치를 가져온 뒤 출발 입력 기본값을 현재 위치로 세팅
          setStartInput(`${location.lat},${location.lng}`);
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
    setActiveFilter(null);
    try {
      await placeApi.loadPlacesData(userLocation.lat, userLocation.lng, 20);
      const recommended = await placeApi.getPlacesByCategory(
        category,
        userLocation.lat,
        userLocation.lng
      );
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
    setActiveFilter(null);

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
            (place.address?.toLowerCase().includes(query.toLowerCase()) ??
              false) ||
            (place.description?.toLowerCase().includes(query.toLowerCase()) ??
              false)
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
            (place.address?.toLowerCase().includes(query.toLowerCase()) ??
              false) ||
            (place.description?.toLowerCase().includes(query.toLowerCase()) ??
              false)
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

  const handlePlaceClick = (place: PlaceDetail) => {
    setSelectedPlace(place);
    // 지도 중심을 선택한 장소로 부드럽게 이동
    if (map) {
      const moveLatLon = new kakao.maps.LatLng(place.latitude, place.longitude);
      map.panTo(moveLatLon);
    } else {
      setMapCenter({ lat: place.latitude, lng: place.longitude });
    }
  };

  const handleSetDestination = async () => {
    if (!selectedPlace) return;

    setIsLoadingRoute(true);
    try {
      // 사용자 위치에서 선택한 장소까지의 경로 가져오기 (GET 쿼리 방식)
      const route = await fetchAccessibleRoute(
        userLocation.lat,
        userLocation.lng,
        selectedPlace.latitude,
        selectedPlace.longitude
      );
      setRoutePoints(route.routePoint ?? []);
    } catch (error) {
      console.error("경로 조회 실패:", error);
      setRoutePoints([]);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleFilterClick = async (filterType: string) => {
    // 같은 필터를 다시 클릭하면 필터 해제하고 초기 장소 표시
    if (activeFilter === filterType) {
      setIsLoadingPlaces(true);
      setActiveFilter(null);
      try {
        await loadNearbyPlaces(userLocation.lat, userLocation.lng, 5);
      } finally {
        setIsLoadingPlaces(false);
      }
      return;
    }

    setIsLoadingPlaces(true);
    setSelectedPlace(null);
    setRoutePoints([]);
    setActiveFilter(filterType);

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
        case "accessible-restroom": {
          const restroomPlaces = await placeApi.getAccessibleRestroomPlaces(
            userLocation.lat,
            userLocation.lng
          );
          // 거리순 정렬
          setPlaces(sortByDistance(restroomPlaces));
          break;
        }
        case "accessible-parking": {
          const parkingPlaces = await placeApi.getAccessibleParkingPlaces(
            userLocation.lat,
            userLocation.lng
          );
          // 거리순 정렬
          setPlaces(sortByDistance(parkingPlaces));
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

  // 도착 입력 자동완성(디바운스)
  useEffect(() => {
    if (!endInput || endInput.trim().length < 2 || !userLocation) {
      setEndSuggestions([]);
      // 사용자가 직접 입력을 지웠다면 선택도 초기화
      if (!endInput) setEndSelectedPlace(null);
      return;
    }

    const fetch = debounce(async (q: string) => {
      try {
        setIsEndSuggestLoading(true);
        const nearby = await placeApi.getNearbyPlaces(
          userLocation.lat,
          userLocation.lng,
          50
        );
        const filtered = nearby.filter((p) =>
          p.name.toLowerCase().includes(q.toLowerCase())
        );
        setEndSuggestions(filtered.slice(0, 8));
      } catch (err) {
        console.error("도착 자동완성 실패:", err);
        setEndSuggestions([]);
      } finally {
        setIsEndSuggestLoading(false);
      }
    }, 300);

    fetch(endInput);
    return () => {
      fetch.cancel && fetch.cancel();
    };
  }, [endInput, userLocation]);

  const handleSelectEndSuggestion = (place: PlaceDetail) => {
    setEndInput(place.name);
    setEndSelectedPlace(place);
    setEndSuggestions([]);
    // 선택 시 편의상 지도 중심을 도착지로 이동
    setMapCenter({ lat: place.latitude, lng: place.longitude });
  };

  if (!isLocationLoaded) {
    return (
      <div className="relative w-full h-full min-h-screen flex items-center justify-center"></div>
    );
  }

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden">
      <KakaoMap
        center={mapCenter}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        level={3}
        onCreate={setMap}
        onCenterChanged={updateCenterWhenMapMoved}
      >
        {/* 사용자 현재 위치 - 파란색 원 */}
        <CustomOverlayMap position={userLocation}>
          {/* <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#16A34A",
              border: "3px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              transform: "translate(-50%, -50%)",
            }}
          /> */}
          <img src={wheelChairImg} alt="" />
        </CustomOverlayMap>

        {/* 장소 마커들 */}
        {places.map((place, index) => {
          // 화장실 또는 주차장 필터일 때 커스텀 마커 표시
          if (
            activeFilter === "accessible-restroom" ||
            activeFilter === "accessible-parking"
          ) {
            const isRestroom = activeFilter === "accessible-restroom";
            return (
              <CustomOverlayMap
                key={place.id ? `place-${place.id}` : `place-idx-${index}`}
                position={{ lat: place.latitude, lng: place.longitude }}
              >
                <div
                  onClick={() => handlePlaceClick(place)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#FF6347",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                  }}
                >
                  {isRestroom ? (
                    <img
                      src={restroomIcon}
                      alt=""
                      style={{
                        width: "20px",
                        height: "20px",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "white",
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      P
                    </span>
                  )}
                </div>
              </CustomOverlayMap>
            );
          }

          // 기본 마커
          return (
            <MapMarker
              key={place.id ? `place-${place.id}` : `place-idx-${index}`}
              position={{ lat: place.latitude, lng: place.longitude }}
              onClick={() => handlePlaceClick(place)}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                size: { width: 24, height: 35 },
              }}
            />
          );
        })}

        {/* 경로 표시 - 경사도에 따라 색상 구분 */}
        {routePoints.length > 0 &&
          routePoints.map((point, index) => {
            // 마지막 점은 선을 그릴 필요 없음
            if (index === routePoints.length - 1) return null;

            const nextPoint = routePoints[index + 1];
            const slope = Math.abs(point.slope);

            // 경사도에 따른 색상 결정
            let color = "#166534"; // 기본 녹색 (5 이상)
            if (slope < 2.5) {
              color = "#22C55E"; // 초록색 계열
            } else if (slope >= 2.5 && slope < 5) {
              color = "#EAB308"; // 노란색 계열
            }

            return (
              <Polyline
                key={`route-${index}`}
                path={[
                  { lat: point.lat, lng: point.lng },
                  { lat: nextPoint.lat, lng: nextPoint.lng },
                ]}
                strokeWeight={5}
                strokeColor={color}
                strokeOpacity={0.8}
                strokeStyle="solid"
              />
            );
          })}
      </KakaoMap>

      <div className="absolute top-4 left-4 right-4 z-10">
        <SearchBar
          onSearch={handleSearch}
          onFilterClick={handleFilterClick}
          onCategorySelectAndRecommend={recommendPlaces}
          userLocation={userLocation}
          onPlaceSelect={handlePlaceClick}
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

      {/* 로딩 인디케이터 */}
      {isLoadingPlaces && <LoadingEffect />}

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
          }}
          isLoadingRoute={isLoadingRoute}
          onSetDestination={handleSetDestination}
        />
      )}
    </div>
  );
};

export default MainPage;
