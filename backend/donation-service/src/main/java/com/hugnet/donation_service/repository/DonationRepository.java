package com.hugnet.donation_service.repository;

import com.hugnet.donation_service.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
}
