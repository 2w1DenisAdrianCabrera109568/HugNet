package com.hugnet.activity_service.controller;

import com.hugnet.activity_service.DTO.ActivityDTO;
import com.hugnet.activity_service.DTO.CreateActivityDTO;
import com.hugnet.activity_service.service.ActivityService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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

    //
    @PostMapping
    public ResponseEntity<ActivityDTO> create(@RequestBody CreateActivityDTO dto) {
        return ResponseEntity.ok(activityService.create(dto));
    }

    //
    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> update(@PathVariable Long id, @RequestBody CreateActivityDTO dto) {
        return ResponseEntity.ok(activityService.update(id, dto));
    }

    //
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    //
    @GetMapping("/coordinator/{coordinatorId}")
    public ResponseEntity<List<ActivityDTO>> getByCoordinator(@PathVariable Long coordinatorId) {
        return ResponseEntity.ok(activityService.getByCoordinator(coordinatorId));
    }

    //
    @PostMapping("/{id}/join/{userId}")
    public ResponseEntity<Void> join(@PathVariable Long id, @PathVariable Long userId) {
        activityService.joinActivity(id, userId);
        return ResponseEntity.ok().build();
    }

    //
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<Long>> participants(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getParticipants(id));
    }

}
