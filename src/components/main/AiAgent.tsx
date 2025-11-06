import { useState, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import placeApi from "../../api/place/place.api";
import type {
  AIRecommendResponse,
  AIRecommendedPlace,
} from "../../types/place/place.type";

interface ChatMessage {
  sender: "user" | "ai";
  message?: string; // For user input or AI summary
  places?: AIRecommendedPlace[]; // For AI recommendations
}

interface AiAgentProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number };
  onPlaceSelect: (place: AIRecommendedPlace) => void;
}

const AiAgent = ({
  isOpen,
  onClose,
  userLocation,
  onPlaceSelect,
}: AiAgentProps) => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { sender: "user", message: userInput };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput(""); // Clear input immediately after sending

    setIsLoading(true);
    try {
      // AI 추천 요청 - 기본값으로 요청 (사용자가 채팅에서 카테고리 등을 명시할 수 있음)
      const response = await placeApi.recommendPlacesWithAI({
        userRequest: userInput,
        category: "PARK", // 기본값, AI가 userRequest를 보고 적절히 추천함
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radiusKm: 10,
        minAccessibilityScore: 0,
      });

      const newAiMessage: ChatMessage = {
        sender: "ai",
        message: response.aiSummary,
        places: response.recommendedPlaces,
      };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);
    } catch (error) {
      console.error("AI 추천 요청 실패:", error);
      // 에러 처리 (옵션: 사용자에게 에러 메시지 표시)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (place: AIRecommendedPlace) => {
    onClose();
    onPlaceSelect(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 transition-all duration-300 ease-out"
      style={{
        height: "85vh",
      }}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">장소 추천</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-col h-[calc(100%-140px)] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 text-sm">원하는 장소를 설명해주세요</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index}>
              {msg.sender === "user" ? (
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-500 text-white rounded-lg px-4 py-2.5 max-w-[75%]">
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {msg.message && (
                    <div className="flex justify-start mb-1">
                      <div className="bg-gray-100 rounded-lg px-4 py-2.5 max-w-[75%]">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  )}
                  {msg.places && msg.places.length > 0 && (
                    <div className="flex flex-col gap-2.5 mt-1">
                      {msg.places.map((place) => (
                        <div
                          key={place.placeId}
                          onClick={() => handleCardClick(place)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-base text-gray-900">
                              {place.name}
                            </h3>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {place.accessibilityScore}점
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {place.category}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            {place.description}
                          </p>
                          <p className="text-xs text-gray-600 pt-2 border-t border-gray-100">
                            {place.recommendationReason}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5">
              <span className="text-sm text-gray-500">검색중...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="조용한 공원을 추천해줘"
            className="flex-1 px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isLoading}
            className="px-5 py-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAgent;
