package com.hugnet.activity_service.controller;


import com.hugnet.activity_service.dto.ActivityStatusUpdateRequest;
import com.hugnet.activity_service.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/activities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")

public class ActivityAdminController {

    private final ActivityService activityService;

    /**
     * Endpoint para actualizar el estado de una actividad.
     * Se usa PATCH porque es una actualización parcial.
     * URL: PATCH http://localhost:8082/api/admin/activities/1/status
     */
    @PatchMapping("/{activityId}/status")
    public ResponseEntity<String> updateActivityStatus(
            @PathVariable Long activityId,
            @RequestBody ActivityStatusUpdateRequest request) {

        activityService.updateStatus(activityId, request.getNewStatus());
        return ResponseEntity.ok("Estado de la actividad actualizado correctamente.");
    }
}