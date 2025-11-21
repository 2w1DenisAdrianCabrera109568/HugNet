package com.hugnet.sponsor_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hugnet.sponsor_service.entity.ActivitySponsor;

public interface ActivitySponsorRepository extends JpaRepository<ActivitySponsor, Long> {
    
}
