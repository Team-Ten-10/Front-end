import { useState, useEffect } from "react";
import { Map as KakaoMap, CustomOverlayMap } from "react-kakao-maps-sdk";
import SearchBar from "../../components/SearchBar";

const MainPage = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.528086,
    lng: 126.917917,
  });
  const [isLocationLoaded, setIsLocationLoaded] = useState(false);

  useEffect(() => {
    // 사용자 위치 가져오기
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLocationLoaded(true);
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          setIsLocationLoaded(true); // 실패해도 기본 위치로 표시
        }
      );
    } else {
      console.error("Geolocation을 지원하지 않는 브라우저입니다.");
      setIsLocationLoaded(true);
    }
  }, []);

  const handleSearch = (query: string, category?: string) => {
    console.log("Search query:", query);
    console.log("Category:", category);
    // TODO: Implement search functionality with Place API
  };

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
        center={userLocation}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        level={3}
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
      </KakaoMap>

      <div className="absolute top-4 left-4 right-4 z-10">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  );
};

export default MainPage;
