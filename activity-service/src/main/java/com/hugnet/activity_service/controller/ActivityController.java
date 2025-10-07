package com.hugnet.activity_service.controller;

;
import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.service.ActivityService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<Activity> create(@RequestBody Activity activity) {
        return ResponseEntity.ok(activityService.createActivity(activity));
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getAll() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getById(@PathVariable Long id) {
        return activityService.getActivityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/coordinator/{id}")
    public ResponseEntity<List<Activity>> getByCoordinator(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getActivitiesByCoordinator(id));
    }
}
