/**
 * 리뷰 응답 타입
 */
export interface ReviewResponse {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * 리뷰 생성 요청 타입
 */
export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

/**
 * 리뷰 수정 요청 타입
 */
export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}
