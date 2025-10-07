package com.hugnet.activity_service.service;

import com.hugnet.activity_service.entity.Activity;

import java.util.*;

public interface ActivityService {
    Activity createActivity(Activity activity);
    List<Activity> getAllActivities();
    List<Activity> getActivitiesByCoordinator(Long id);
    Optional<Activity> getActivityById(Long id);
}
