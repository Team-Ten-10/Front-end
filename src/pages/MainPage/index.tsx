import { Map } from "react-kakao-maps-sdk";

const MainPage = () => {
  return (
    <div className="relative w-full h-full min-h-screen">
      <Map
        center={{ lat: 37.528086, lng: 126.917917 }}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        level={3}
      />
      
      <div className="absolute top-5 left-5 bg-white p-2.5 rounded-lg shadow-md z-10">
        검색창
      </div>
    </div>
  );
};

export default MainPage;
