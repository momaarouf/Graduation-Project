package com.travelmarket.backend.review.dto;

import org.springframework.data.domain.Page;

/**
 * Aggregated response for guide and tour review listing endpoints.
 *
 * Combines:
 *  - Average sub-ratings (overall, guide, tour, value)
 *  - Total review count
 *  - Star distribution histogram (1–5 stars)
 *  - Paginated list of individual ReviewResponse objects
 *
 * The frontend ReviewListProps already expects averageRating + totalReviews +
 * reviewSummary {fiveStar, fourStar, ...} — this DTO maps directly to that shape.
 */
public record ReviewSummaryResponse(

        // ── Aggregate averages ────────────────────────────────────────────
        // null if no reviews exist yet (guide/tour is new)

        Double averageOverall,
        Double averageGuide,
        Double averageTour,
        Double averageValue,

        // ── Total count ───────────────────────────────────────────────────
        Long totalReviews,

        // ── Star distribution (maps to frontend reviewSummary) ────────────
        Distribution distribution,

        // ── Paginated review list ─────────────────────────────────────────
        Page<ReviewResponse> reviews

) {

    /**
     * Histogram of how many reviews each star level received.
     * Built from the rating_overall column (the "headline" rating).
     *
     * Matches the frontend reviewSummary shape:
     *   { fiveStar, fourStar, threeStar, twoStar, oneStar }
     */
    public record Distribution(
            long fiveStar,
            long fourStar,
            long threeStar,
            long twoStar,
            long oneStar
    ) {

        /**
         * Build a Distribution from the raw JPQL GROUP BY result.
         *
         * @param rows List of Object[]{Short ratingOverall, Long count}
         *             from ReviewRepository.findRatingDistribution*()
         */
        public static Distribution from(java.util.List<Object[]> rows) {
            long five = 0, four = 0, three = 0, two = 0, one = 0;

            for (Object[] row : rows) {
                // rating is stored as Short (SMALLINT) — safe to cast
                int rating = ((Number) row[0]).intValue();
                long count  = ((Number) row[1]).longValue();

                switch (rating) {
                    case 5 -> five  = count;
                    case 4 -> four  = count;
                    case 3 -> three = count;
                    case 2 -> two   = count;
                    case 1 -> one   = count;
                }
            }
            return new Distribution(five, four, three, two, one);
        }

        /** Convenience: empty distribution when no reviews exist yet. */
        public static Distribution empty() {
            return new Distribution(0, 0, 0, 0, 0);
        }
    }
}