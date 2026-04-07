package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.TravelerPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelerPaymentMethodRepository extends JpaRepository<TravelerPaymentMethod, Long> {
    List<TravelerPaymentMethod> findByTravelerProfileId(Long travelerProfileId);
    long countByTravelerProfileId(Long travelerProfileId);
}
