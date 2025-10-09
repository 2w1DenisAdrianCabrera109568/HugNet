package com.hugnet.activity_service.service;

import com.hugnet.activity_service.DTO.*;
import com.hugnet.activity_service.entity.Activity;

import java.util.*;

public interface ActivityService {
    List<ActivityDTO> getAll();
    ActivityDTO getById(Long id);
    ActivityDTO create(CreateActivityDTO dto);
    ActivityDTO update(Long id, CreateActivityDTO dto);
    void delete(Long id);
    List<ActivityDTO> getByCoordinator(Long coordinatorId);
    List<Long> getParticipants(Long activityId);
    void joinActivity(Long activityId, Long userId);
}