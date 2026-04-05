package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;


public interface TourTemplateRepository extends JpaRepository<TourTemplate, Long> {

    // ── Guide-scoped queries ────────────────────────────────────────────────────
    
    long countByGuideIdAndStatus(Long guideId, TourTemplateStatus status);

    long countByStatusAndDeletedAtUtcIsNull(TourTemplateStatus status);

    @Query("SELECT COUNT(t) FROM TourTemplate t WHERE t.status = 'PUBLISHED' AND t.deletedAtUtc IS NULL AND t.category = :category")
    long countPublishedByCategory(@Param("category") String category);

    @Query("SELECT t.category as category, COUNT(t) as count FROM TourTemplate t WHERE t.status = 'PUBLISHED' AND t.deletedAtUtc IS NULL AND t.category IS NOT NULL GROUP BY t.category")
    List<Object[]> countByCategories();

    @Query("SELECT t.city as city, COUNT(t) as count FROM TourTemplate t WHERE t.status = 'PUBLISHED' AND t.deletedAtUtc IS NULL AND t.city IS NOT NULL GROUP BY t.city")
    List<Object[]> countByCities();


    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.guide.id = :guideId
          AND t.deletedAtUtc IS NULL
        ORDER BY t.createdAtUtc DESC
    """)
    List<TourTemplate> findAllByGuideId(@Param("guideId") Long guideId);

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.guide.id = :guideId
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findByIdAndGuideId(
            @Param("id") Long id,
            @Param("guideId") Long guideId
    );

    // ── Admin queries ───────────────────────────────────────────────────────────

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = :status
          AND t.deletedAtUtc IS NULL
        ORDER BY t.updatedAtUtc ASC
    """)
    List<TourTemplate> findByStatusOrderByUpdatedAtAsc(@Param("status") TourTemplateStatus status);

    // ── Public listing queries ──────────────────────────────────────────────────

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = :status
          AND t.deletedAtUtc IS NULL
          AND (:regions IS NULL OR LOWER(t.region) IN :regions)
          AND (:countryCodes IS NULL OR UPPER(t.countryCode) IN :countryCodes)
          AND (:category IS NULL OR LOWER(t.category) = :category)
          AND (:cities IS NULL OR LOWER(t.city) IN :cities)
          AND (:query IS NULL OR (LOWER(t.title) LIKE :query OR LOWER(t.description) LIKE :query OR LOWER(t.guide.user.fullName) LIKE :query))
          AND (:halalFriendly IS NULL OR COALESCE(t.halalFriendly, false) = :halalFriendly)
          AND (:instantBook IS NULL OR COALESCE(t.instantBook, false) = :instantBook)
          AND (:minPrice IS NULL OR t.basePrice >= :minPrice)
          AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice)
          AND (COALESCE(:minDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) >= :minDuration)
          AND (COALESCE(:maxDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) <= :maxDuration)
          AND (:minCap IS NULL OR COALESCE(t.maxCapacity, 0) >= :minCap)
          AND (:maxCap IS NULL OR COALESCE(t.maxCapacity, 999) <= :maxCap)
          AND (:minRating IS NULL OR COALESCE(t.averageRating, 0) >= :minRating)
          AND (:isPremium IS NULL OR COALESCE(t.isPremium, false) = :isPremium)
          AND (:isFamilyFriendly IS NULL OR COALESCE(t.isFamilyFriendly, true) = :isFamilyFriendly)
          AND (:hasGroupDiscount IS NULL OR COALESCE(t.hasGroupDiscount, false) = :hasGroupDiscount)
          AND (:language IS NULL OR LOWER(COALESCE(t.languages, '')) LIKE :language)
        ORDER BY t.createdAtUtc DESC
    """)
    List<TourTemplate> findWithFilters(
            @Param("status") TourTemplateStatus status,
            @Param("regions") List<String> regions,
            @Param("countryCodes") List<String> countryCodes,
            @Param("category") String category,
            @Param("cities") List<String> cities,
            @Param("query") String query,
            @Param("halalFriendly") Boolean halalFriendly,
            @Param("instantBook") Boolean instantBook,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("minCap") Integer minCap,
            @Param("maxCap") Integer maxCap,
            @Param("minRating") java.math.BigDecimal minRating,
            @Param("isPremium") Boolean isPremium,
            @Param("isFamilyFriendly") Boolean isFamilyFriendly,
            @Param("hasGroupDiscount") Boolean hasGroupDiscount,
            @Param("language") String language
    );

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = :status
          AND t.deletedAtUtc IS NULL
          AND (:regions IS NULL OR LOWER(t.region) IN :regions)
          AND (:countryCodes IS NULL OR UPPER(t.countryCode) IN :countryCodes)
          AND (:category IS NULL OR LOWER(t.category) = :category)
          AND (:cities IS NULL OR LOWER(t.city) IN :cities)
          AND (:query IS NULL OR (LOWER(t.title) LIKE :query OR LOWER(t.description) LIKE :query OR LOWER(t.guide.user.fullName) LIKE :query))
          AND (:halalFriendly IS NULL OR COALESCE(t.halalFriendly, false) = :halalFriendly)
          AND (:instantBook IS NULL OR COALESCE(t.instantBook, false) = :instantBook)
          AND (:minPrice IS NULL OR t.basePrice >= :minPrice)
          AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice)
          AND (COALESCE(:minDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) >= :minDuration)
          AND (COALESCE(:maxDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) <= :maxDuration)
          AND (:minCap IS NULL OR COALESCE(t.maxCapacity, 0) >= :minCap)
          AND (:maxCap IS NULL OR COALESCE(t.maxCapacity, 999) <= :maxCap)
          AND (:minRating IS NULL OR COALESCE(t.averageRating, 0) >= :minRating)
          AND (:isPremium IS NULL OR COALESCE(t.isPremium, false) = :isPremium)
          AND (:isFamilyFriendly IS NULL OR COALESCE(t.isFamilyFriendly, true) = :isFamilyFriendly)
          AND (:hasGroupDiscount IS NULL OR COALESCE(t.hasGroupDiscount, false) = :hasGroupDiscount)
          AND (:language IS NULL OR LOWER(COALESCE(t.languages, '')) LIKE :language)
        ORDER BY t.basePrice ASC
    """)
    List<TourTemplate> findWithFiltersPriceAsc(
            @Param("status") TourTemplateStatus status,
            @Param("regions") List<String> regions,
            @Param("countryCodes") List<String> countryCodes,
            @Param("category") String category,
            @Param("cities") List<String> cities,
            @Param("query") String query,
            @Param("halalFriendly") Boolean halalFriendly,
            @Param("instantBook") Boolean instantBook,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("minCap") Integer minCap,
            @Param("maxCap") Integer maxCap,
            @Param("minRating") java.math.BigDecimal minRating,
            @Param("isPremium") Boolean isPremium,
            @Param("isFamilyFriendly") Boolean isFamilyFriendly,
            @Param("hasGroupDiscount") Boolean hasGroupDiscount,
            @Param("language") String language
    );

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = :status
          AND t.deletedAtUtc IS NULL
          AND (:regions IS NULL OR LOWER(t.region) IN :regions)
          AND (:countryCodes IS NULL OR UPPER(t.countryCode) IN :countryCodes)
          AND (:category IS NULL OR LOWER(t.category) = :category)
          AND (:cities IS NULL OR LOWER(t.city) IN :cities)
          AND (:query IS NULL OR (LOWER(t.title) LIKE :query OR LOWER(t.description) LIKE :query OR LOWER(t.guide.user.fullName) LIKE :query))
          AND (:halalFriendly IS NULL OR COALESCE(t.halalFriendly, false) = :halalFriendly)
          AND (:instantBook IS NULL OR COALESCE(t.instantBook, false) = :instantBook)
          AND (:minPrice IS NULL OR t.basePrice >= :minPrice)
          AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice)
          AND (COALESCE(:minDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) >= :minDuration)
          AND (COALESCE(:maxDuration, 0) = 0 OR (COALESCE(t.durationHours, 0) * 60 + COALESCE(t.durationMinutes, 0)) <= :maxDuration)
          AND (:minCap IS NULL OR COALESCE(t.maxCapacity, 0) >= :minCap)
          AND (:maxCap IS NULL OR COALESCE(t.maxCapacity, 999) <= :maxCap)
          AND (:minRating IS NULL OR COALESCE(t.averageRating, 0) >= :minRating)
          AND (:isPremium IS NULL OR COALESCE(t.isPremium, false) = :isPremium)
          AND (:isFamilyFriendly IS NULL OR COALESCE(t.isFamilyFriendly, true) = :isFamilyFriendly)
          AND (:hasGroupDiscount IS NULL OR COALESCE(t.hasGroupDiscount, false) = :hasGroupDiscount)
          AND (:language IS NULL OR LOWER(COALESCE(t.languages, '')) LIKE :language)
        ORDER BY t.basePrice DESC
    """)
    List<TourTemplate> findWithFiltersPriceDesc(
            @Param("status") TourTemplateStatus status,
            @Param("regions") List<String> regions,
            @Param("countryCodes") List<String> countryCodes,
            @Param("category") String category,
            @Param("cities") List<String> cities,
            @Param("query") String query,
            @Param("halalFriendly") Boolean halalFriendly,
            @Param("instantBook") Boolean instantBook,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("minCap") Integer minCap,
            @Param("maxCap") Integer maxCap,
            @Param("minRating") java.math.BigDecimal minRating,
            @Param("isPremium") Boolean isPremium,
            @Param("isFamilyFriendly") Boolean isFamilyFriendly,
            @Param("hasGroupDiscount") Boolean hasGroupDiscount,
            @Param("language") String language
    );

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.status = :status
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findByIdAndStatus(
            @Param("id") Long id,
            @Param("status") TourTemplateStatus status
    );

    @Query("""
        SELECT COUNT(t) FROM TourTemplate t
        WHERE t.guide.id = :guideId
          AND t.lastPublishedAtUtc IS NOT NULL
          AND t.showInPortfolio = true
          AND t.deletedAtUtc IS NULL
    """)
    long countPortfolioByGuideId(@Param("guideId") Long guideId);

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.guide.id = :guideId
          AND t.lastPublishedAtUtc IS NOT NULL
          AND t.showInPortfolio = true
          AND t.deletedAtUtc IS NULL
        ORDER BY t.lastPublishedAtUtc DESC
    """)
    List<TourTemplate> findPortfolioByGuideId(@Param("guideId") Long guideId);

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.guide.id = :guideId
          AND t.lastPublishedAtUtc IS NOT NULL
          AND t.showInPortfolio = true
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findPortfolioTourByIdAndGuideId(
            @Param("id") Long id,
            @Param("guideId") Long guideId
    );

    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findByIdNotDeleted(@Param("id") Long id);

    // ── 1. Bounding Box Search ────────────────────────────────────────────────
    //
    // Returns all PUBLISHED tours whose meeting point falls within the
    // supplied lat/lng rectangle (bounding box).
    //
    // Used when the user pans/zooms the map — the frontend sends the current
    // map viewport bounds and receives only the tours visible in that area.
    //
    // Parameters:
    //   minLat, maxLat — latitude range  (south edge, north edge)
    //   minLng, maxLng — longitude range (west edge,  east edge)
    //
    // The partial index idx_tour_templates_meeting_coords (added in V44)
    // makes this a near-instant range scan rather than a full table scan.
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status            = 'PUBLISHED'
          AND t.deletedAtUtc      IS NULL
          AND t.meetingLatitude   IS NOT NULL
          AND t.meetingLongitude  IS NOT NULL
          AND t.meetingLatitude   >= :minLat
          AND t.meetingLatitude   <= :maxLat
          AND t.meetingLongitude  >= :minLng
          AND t.meetingLongitude  <= :maxLng
        ORDER BY t.createdAtUtc DESC
    """)
    List<TourTemplate> findWithinBoundingBox(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng
    );

    // ── 2. Radius / Proximity Search (Haversine) ──────────────────────────────
    //
    // Returns all PUBLISHED tours whose meeting point is within radiusKm
    // kilometres of the supplied centre point (lat, lng).
    //
    // Uses the haversine formula — the standard spherical distance formula
    // for Earth coordinates. Accurate to within ~0.5% for distances under
    // 1000 km, which is more than sufficient for Lebanon-scale searches.
    //
    // Formula breakdown:
    //   6371 = Earth radius in kilometres
    //   The acos(cos*cos*cos + sin*sin) term = central angle between two points
    //   Multiplied by radius = arc length = distance in km
    //
    // Performance note: haversine requires a full scan of coordinate-indexed rows.
    // The bounding box index in V44 helps narrow the candidate set, but Postgres
    // cannot use it directly for the acos computation. For Lebanon's tour count
    // this is fast enough. For large-scale use: add PostGIS.
    //
    // Parameters:
    //   lat       — centre latitude  (traveler's location or map centre)
    //   lng       — centre longitude
    //   radiusKm  — search radius in kilometres (validated 0.1–500 in controller)
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status           = 'PUBLISHED'
          AND t.deletedAtUtc     IS NULL
          AND t.meetingLatitude  IS NOT NULL
          AND t.meetingLongitude IS NOT NULL
          AND (6371.0 * acos(
                  LEAST(1.0,
                      cos(radians(:lat)) * cos(radians(t.meetingLatitude))
                      * cos(radians(t.meetingLongitude) - radians(:lng))
                      + sin(radians(:lat)) * sin(radians(t.meetingLatitude))
                  )
              )) <= :radiusKm
        ORDER BY (6371.0 * acos(
                  LEAST(1.0,
                      cos(radians(:lat)) * cos(radians(t.meetingLatitude))
                      * cos(radians(t.meetingLongitude) - radians(:lng))
                      + sin(radians(:lat)) * sin(radians(t.meetingLatitude))
                  )
              )) ASC
    """)
    List<TourTemplate> findWithinRadius(
            @Param("lat")      double lat,
            @Param("lng")      double lng,
            @Param("radiusKm") double radiusKm
    );
}

// BUFFER ZONE START
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// BUFFER ZONE END
