package com.hugnet.activity_service.repository;


import com.hugnet.activity_service.entity.ActivityParticipant;
import com.hugnet.activity_service.entity.ActivityParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityParticipantRepository extends JpaRepository<ActivityParticipant, ActivityParticipantId> {
    List<ActivityParticipant> findByIdActivityId(Long activityId);
    List<ActivityParticipant> findByIdUserId(Long userId);
}