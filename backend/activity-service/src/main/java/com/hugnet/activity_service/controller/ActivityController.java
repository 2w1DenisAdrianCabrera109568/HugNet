package com.hugnet.activity_service.controller;

import com.hugnet.activity_service.dto.ActivityAttendanceDTO;
import com.hugnet.activity_service.dto.ActivityDTO;
import com.hugnet.activity_service.dto.CreateActivityDTO;
import com.hugnet.activity_service.service.ActivityService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor

public class ActivityController {

    private final ActivityService activityService;

    //Get all activities
    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getAll() {
        return ResponseEntity.ok(activityService.getAll());
    }

    //Get activity by id
    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getById(id));
    }

    //Create activity
    @PostMapping
    public ResponseEntity<ActivityDTO> create(@RequestBody CreateActivityDTO dto) {
        return ResponseEntity.ok(activityService.createActivity(dto));
    }

    //Update activity
    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> update(@PathVariable Long id, @RequestBody CreateActivityDTO dto) {
        return ResponseEntity.ok(activityService.updateActivity(id, dto));
    }

    //Delete activity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }

    //Get activities by coordinator
    @GetMapping("/coordinator/{coordinatorId}")
    public ResponseEntity<List<ActivityDTO>> getByCoordinator(@PathVariable Long coordinatorId) {
        return ResponseEntity.ok(activityService.getByCoordinator(coordinatorId));
    }

    //Join activity
    @PostMapping("/{id}/join/{userId}")
    public ResponseEntity<Void> join(@PathVariable Long id, @PathVariable Long userId) {
        activityService.joinActivity(id, userId);
        return ResponseEntity.ok().build();
    }

    //Get participants of an activity

    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<Long>> participants(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getParticipants(id));
    }

    //Get attendance data for report
    @GetMapping("/{activityId}/attendance-data")
    public ResponseEntity<ActivityAttendanceDTO> getAttendanceDataForReport(@PathVariable Long activityId) {
        return ResponseEntity.ok(activityService.getAttendanceData(activityId));
    }

}
