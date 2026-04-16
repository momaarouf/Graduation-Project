package com.travelmarket.backend.dispute.repository;

import com.travelmarket.backend.dispute.entity.Dispute;
import com.travelmarket.backend.dispute.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {

    Optional<Dispute> findByBookingId(Long bookingId);

    // For admins: all disputes
    Page<Dispute> findAllByOrderByCreatedAtUtcDesc(Pageable pageable);

    // For users: disputes they opened or are against them
    List<Dispute> findByOpenedByUserIdOrAgainstUserIdOrderByCreatedAtUtcDesc(Long openedByUserId, Long againstUserId);

    // Check if duplicate dispute exists (that hasn't been rejected)
    boolean existsByBookingIdAndStatusIn(Long bookingId, Collection<DisputeStatus> statuses);
}
