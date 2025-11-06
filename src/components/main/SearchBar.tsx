import { useState, useRef } from "react";
import {
  Search,
  ChevronDown,
  LayoutGrid,
  TreeDeciduous,
  Landmark,
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  BookOpen,
  Film,
  MapPin,
  Dumbbell,
  Palette,
  Mic,
  MicOff,
} from "lucide-react";
import FilterChipButton from "./FilterChipButton";
import type { Category } from "../../types/place/place.type";

interface SearchBarProps {
  onSearch: (query: string, category?: string) => void;
  onFilterClick?: (filterType: string) => void;
  onCategorySelectAndRecommend: (category: Category) => void;
}

const SearchBar = ({
  onSearch,
  onFilterClick,
  onCategorySelectAndRecommend,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCategories, setShowCategories] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const categories = [
    { value: "", label: "전체", Icon: LayoutGrid },
    { value: "PARK", label: "공원", Icon: TreeDeciduous },
    { value: "MUSEUM", label: "박물관", Icon: Landmark },
    { value: "CAFE", label: "카페", Icon: Coffee },
    { value: "RESTAURANT", label: "음식점", Icon: UtensilsCrossed },
    { value: "SHOPPING_MALL", label: "쇼핑몰", Icon: ShoppingBag },
    { value: "LIBRARY", label: "도서관", Icon: BookOpen },
    { value: "THEATER", label: "극장", Icon: Film },
    { value: "TOURIST_SPOT", label: "관광지", Icon: MapPin },
    { value: "SPORTS_CENTER", label: "스포츠센터", Icon: Dumbbell },
    { value: "ART_GALLERY", label: "미술관", Icon: Palette },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedCategory || undefined);
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setShowCategories(false);
    setActiveFilter(null); // 카테고리 선택 시 필터 해제
    if (value) {
      onCategorySelectAndRecommend(value as Category);
    }
  };

  const handleFilterClick = (filterType: string) => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
    onFilterClick?.(filterType);
  };

  const startVoiceRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("음성 인식을 지원하지 않는 브라우저입니다.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("음성 인식에 실패했습니다.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const currentCategory = categories.find(
    (cat) => cat.value === selectedCategory
  );
  const CurrentIcon = currentCategory?.Icon || LayoutGrid;

  return (
    <div className="w-full">
      {/* 검색바 */}
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-lg overflow-visible">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center px-4 py-3">
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors mr-2"
              >
                <CurrentIcon className="w-5 h-5 text-gray-700" />
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    showCategories ? "rotate-180" : ""
                  }`}
                />
              </button>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="장소, 주소 검색"
                className="flex-1 text-base focus:outline-none"
              />

              <button
                type="button"
                onClick={
                  isListening ? stopVoiceRecognition : startVoiceRecognition
                }
                className={`ml-2 p-2 rounded-full transition-colors ${
                  isListening
                    ? "bg-red-50 hover:bg-red-100 text-red-600"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                type="submit"
                className="ml-2 p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </form>

          {/* 카테고리 목록 */}
          {showCategories && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border-t border-gray-100 z-50">
              <div className="grid grid-cols-3 gap-1 p-2">
                {categories.map((cat) => {
                  const CategoryIcon = cat.Icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                        selectedCategory === cat.value
                          ? "bg-green-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <CategoryIcon
                        className={`w-6 h-6 ${
                          selectedCategory === cat.value
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          selectedCategory === cat.value
                            ? "text-green-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 빠른 필터 칩 */}
      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
        <FilterChipButton
          label="휠체어 접근 가능"
          filterType="wheelchair"
          isActive={activeFilter === "wheelchair"}
          onClick={handleFilterClick}
        />
        <FilterChipButton
          label="내 주변"
          filterType="nearby"
          isActive={activeFilter === "nearby"}
          onClick={handleFilterClick}
        />
        <FilterChipButton
          label="높은 접근성"
          filterType="highAccessibility"
          isActive={activeFilter === "highAccessibility"}
          onClick={handleFilterClick}
        />
      </div>
    </div>
  );
};

export default SearchBar;
