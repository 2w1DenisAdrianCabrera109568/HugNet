package com.hugnet.activity_service.service;

import com.hugnet.activity_service.DTO.*;
import com.hugnet.activity_service.entity.ActivityStatus;

import java.util.*;

public interface ActivityService {
    List<ActivityDTO> getAll();
    ActivityDTO getById(Long id);
    ActivityDTO createActivity(CreateActivityDTO dto);
    ActivityDTO updateActivity(Long id, CreateActivityDTO dto);
    void deleteActivity(Long id);
    List<ActivityDTO> getByCoordinator(Long coordinatorId);
    List<Long> getParticipants(Long activityId);
    void joinActivity(Long activityId, Long userId);
    void updateStatus(Long activityId, ActivityStatus newStatus);
}