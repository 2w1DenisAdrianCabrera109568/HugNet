package com.hugnet.activity_service.service.impl;

import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.repository.ActivityRepository;
import com.hugnet.activity_service.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;

    @Override
    public Activity createActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    @Override
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    @Override
    public List<Activity> getActivitiesByCoordinator(Long id) {
        return activityRepository.findByCoordinadorId(id);
    }

    @Override
    public Optional<Activity> getActivityById(Long id) {
        return activityRepository.findById(id);
    }
}