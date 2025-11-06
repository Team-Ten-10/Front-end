import customAxios from "../../libs/axios/customAxios";
import type {
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "../../types/review/review.type";

class ReviewApi {
  /**
   * 리뷰 작성
   * POST /api/places/{placeId}/reviews
   */
  public async createReview(
    placeId: number,
    data: CreateReviewRequest
  ): Promise<ReviewResponse> {
    const response = await customAxios.post<ReviewResponse>(
      `/api/places/${placeId}/reviews`,
      data
    );
    return response.data;
  }

  /**
   * 리뷰 조회
   * GET /api/places/{placeId}/reviews
   */
  public async getReviews(placeId: number): Promise<ReviewResponse[]> {
    const response = await customAxios.get<ReviewResponse[]>(
      `/api/places/${placeId}/reviews`
    );
    return response.data;
  }

  /**
   * 리뷰 수정
   * PUT /api/reviews/{reviewId}
   */
  public async updateReview(
    reviewId: number,
    data: UpdateReviewRequest
  ): Promise<ReviewResponse> {
    const response = await customAxios.put<ReviewResponse>(
      `/api/reviews/${reviewId}`,
      data
    );
    return response.data;
  }

  /**
   * 리뷰 삭제
   * DELETE /api/reviews/{reviewId}
   */
  public async deleteReview(reviewId: number): Promise<void> {
    await customAxios.delete(`/api/reviews/${reviewId}`);
  }
}

export default new ReviewApi();
