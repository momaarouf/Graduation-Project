package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.TourMapPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TourMapPointRepository extends JpaRepository<TourMapPoint, Long> {

    /**
     * All waypoints for a specific occurrence, ordered by order_index.
     * Returns the ordered route the guide has plotted for this run.
     */
    @Query("""
        SELECT p FROM TourMapPoint p
        WHERE p.occurrence.id = :occurrenceId
        ORDER BY p.orderIndex ASC
    """)
    List<TourMapPoint> findAllByOccurrenceIdOrdered(@Param("occurrenceId") Long occurrenceId);

    /**
     * Delete all waypoints for an occurrence in one query.
     * Used when a guide replaces the entire route — simpler than
     * diffing individual points. All-or-nothing, called within a transaction.
     */
    @Modifying
    @Transactional
    @Query("""
        DELETE FROM TourMapPoint p
        WHERE p.occurrence.id = :occurrenceId
    """)
    void deleteAllByOccurrenceId(@Param("occurrenceId") Long occurrenceId);
}