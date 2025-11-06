import { useState, useEffect } from "react";
import type { PlaceDetail } from "../../types/place/place.type";
import type { ReviewResponse } from "../../types/review/review.type";
import LoadingEffect from "../common/LoadingEffect";
import reviewApi from "../../api/review/review.api";
import { Star, X, MapPin, Phone, Clock } from "lucide-react";

interface PlaceDetailSheetProps {
  place: PlaceDetail;
  onClose: () => void;
  isLoadingRoute?: boolean;
  onSetDestination?: () => void;
}

const PlaceDetailSheet = ({
  place,
  onClose,
  isLoadingRoute = false,
  onSetDestination,
}: PlaceDetailSheetProps) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  // 평균 별점 계산
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  // 리뷰 조회
  useEffect(() => {
    const fetchReviews = async () => {
      if (!place.id) return;
      setIsLoadingReviews(true);
      try {
        const reviewData = await reviewApi.getReviews(place.id);
        setReviews(reviewData);
      } catch (error) {
        console.error("리뷰 조회 실패:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [place.id]);

  // 리뷰 작성
  const handleSubmitReview = async () => {
    if (!place.id || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const newReview = await reviewApi.createReview(place.id, {
        rating,
        comment: comment.trim(),
      });
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
      setShowReviewForm(false);
    } catch (error) {
      console.error("리뷰 작성 실패:", error);
      alert("리뷰 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 max-h-[85vh] flex flex-col">
      {/* 헤더 */}
      <div className="flex-shrink-0">
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 타이틀과 닫기 버튼 */}
        <div className="px-5 pb-3 flex justify-between items-start">
          <div className="flex-1 pr-3">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {place.name}
            </h2>
            {place.categoryDisplayName && (
              <p className="text-xs text-gray-500 mt-1">
                {place.categoryDisplayName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 평점 표시 */}
        {reviews.length > 0 && (
          <div className="px-5 pb-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{averageRating}</span>
            </div>
            <span className="text-sm text-gray-500">리뷰 {reviews.length}개</span>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="px-5 pb-4 flex gap-2">
          <button
            onClick={() => {}}
            className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            출발
          </button>
          <button
            onClick={onSetDestination}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            도착
          </button>
        </div>

        {/* 탭 */}
        <div className="border-b border-gray-200">
          <div className="px-5 flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              정보
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              리뷰 ({reviews.length})
            </button>
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "info" ? (
          <div className="px-5 py-4 space-y-5">
            {/* 기본 정보 */}
            {place.description && (
              <p className="text-sm text-gray-700">{place.description}</p>
            )}

            {/* 연락 정보 */}
            <div className="space-y-3">
              {place.address && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">주소</p>
                    <p className="text-sm text-gray-900">{place.address}</p>
                  </div>
                </div>
              )}
              {place.contactNumber && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">연락처</p>
                    <p className="text-sm text-gray-900">{place.contactNumber}</p>
                  </div>
                </div>
              )}
              {place.operatingHours && (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">운영시간</p>
                    <p className="text-sm text-gray-900">{place.operatingHours}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 접근성 정보 */}
            {(place.accessibilityInfo || place.accessibilityScore !== undefined) && (
              <div className="border-t pt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  접근성 정보
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600">접근성 점수:</span>
                  <span className="text-lg font-bold text-green-600">
                    {place.accessibilityInfo?.accessibilityScore ??
                      place.accessibilityScore ??
                      "N/A"}
                    점
                  </span>
                </div>
                {place.accessibilityInfo && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {place.accessibilityInfo.wheelchairAccessible && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>휠체어 접근 가능</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasElevator && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>엘리베이터</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasAccessibleParking && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>장애인 주차장</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasAccessibleRestroom && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>장애인 화장실</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasRamp && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>경사로</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasAutomaticDoor && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>자동문</span>
                        </div>
                      )}
                      {place.accessibilityInfo.hasBrailleBlock && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          <span>점자블록</span>
                        </div>
                      )}
                    </div>
                    {place.accessibilityInfo.accessibilityDescription && (
                      <p className="mt-3 text-sm text-gray-600">
                        {place.accessibilityInfo.accessibilityDescription}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            {/* 리뷰 작성 버튼 */}
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {showReviewForm ? "작성 취소" : "리뷰 작성하기"}
            </button>

            {/* 리뷰 작성 폼 */}
            {showReviewForm && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    평점
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    내용
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="리뷰를 작성해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !comment.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "등록 중..." : "리뷰 등록"}
                </button>
              </div>
            )}

            {/* 리뷰 목록 */}
            <div className="space-y-3">
              {isLoadingReviews ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  리뷰를 불러오는 중...
                </p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.authorName}
                        </p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 로딩 인디케이터 */}
      {isLoadingRoute && <LoadingEffect />}
    </div>
  );
};

export default PlaceDetailSheet;
