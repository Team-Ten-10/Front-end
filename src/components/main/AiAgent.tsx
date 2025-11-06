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
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.15)] z-50 transition-all duration-500 ease-out backdrop-blur-sm"
      style={{
        height: "85vh",
      }}
    >
      {/* 헤더 */}
      <div className="relative flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">AI 장소 추천</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X size={22} className="text-gray-600" />
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-col h-[calc(100%-150px)] overflow-y-auto p-5 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
              <Bot size={40} className="text-gray-600" />
            </div>
            <div>
              <p className="text-gray-600 text-lg font-medium">AI 장소 추천 시작하기</p>
              <p className="text-gray-400 text-sm mt-2">원하는 장소를 설명해주세요</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="animate-fadeIn">
              {msg.sender === "user" ? (
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-500 text-white rounded-2xl rounded-br-xl px-5 py-3 max-w-[80%] shadow-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {msg.message && (
                    <div className="flex justify-start mb-1">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-xl px-5 py-3 max-w-[80%] shadow-sm border border-gray-200">
                        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  )}
                  {msg.places && msg.places.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                      {msg.places.map((place) => (
                        <div
                          key={place.placeId}
                          onClick={() => handleCardClick(place)}
                          className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                              {place.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-semibold text-green-600">
                                {place.accessibilityScore}점
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">
                              {place.category}
                            </span>
                          </p>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {place.description}
                          </p>
                          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
                            <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <p className="text-xs text-green-700 leading-relaxed">
                              {place.recommendationReason}
                            </p>
                          </div>
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
            <div className="bg-gray-100 rounded-2xl rounded-bl-xl px-5 py-3 shadow-sm">
              <span className="text-sm text-gray-500">AI가 생각중...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input 영역 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="조용한 공원을 추천해줘"
            className="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isLoading}
            className="w-[52px] h-[52px] flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAgent;
