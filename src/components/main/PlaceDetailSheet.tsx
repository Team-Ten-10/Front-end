import type { PlaceDetail } from "../../types/place/place.type";

interface PlaceDetailSheetProps {
  place: PlaceDetail;
  onClose: () => void;
  isLoadingRoute?: boolean;
}

const PlaceDetailSheet = ({
  place,
  onClose,
  isLoadingRoute = false,
}: PlaceDetailSheetProps) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-20 max-h-[60vh] overflow-y-auto">
      <div className="p-6">
        {/* 드래그 핸들 */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 장소 정보 */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{place.name}</h2>
            {place.categoryDisplayName && (
              <p className="text-sm text-gray-500 mt-1">
                {place.categoryDisplayName}
              </p>
            )}
          </div>

          {place.description && (
            <p className="text-gray-700">{place.description}</p>
          )}

          {(place.address || place.contactNumber || place.operatingHours) && (
            <div className="space-y-2">
              {place.address && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 w-20">
                    주소
                  </span>
                  <span className="text-sm text-gray-900">{place.address}</span>
                </div>
              )}
              {place.contactNumber && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 w-20">
                    연락처
                  </span>
                  <span className="text-sm text-gray-900">
                    {place.contactNumber}
                  </span>
                </div>
              )}
              {place.operatingHours && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600 w-20">
                    운영시간
                  </span>
                  <span className="text-sm text-gray-900">
                    {place.operatingHours}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 접근성 정보 */}
          {place.accessibilityInfo || place.accessibilityScore !== undefined ? (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                접근성 정보
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">
                  접근성 점수:
                </span>
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
          ) : (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">접근성 정보가 없습니다.</p>
            </div>
          )}

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>

        {/* 로딩 인디케이터 */}
        {isLoadingRoute && (
          <div className="mt-4 text-center text-sm text-gray-500">
            경로를 불러오는 중...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailSheet;
