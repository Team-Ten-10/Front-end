import { Map } from "react-kakao-maps-sdk";
import SearchBar from "../../components/SearchBar";

const MainPage = () => {
  const handleSearch = (query: string, category?: string) => {
    console.log("Search query:", query);
    console.log("Category:", category);
    // TODO: Implement search functionality with Place API
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      <Map
        center={{ lat: 37.528086, lng: 126.917917 }}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        level={3}
      />

      <div className="absolute top-4 left-4 right-4 z-10">
        <SearchBar onSearch={handleSearch} />
      </div>
    </div>
  );
};

export default MainPage;
