package com.hugnet.activity_service.service.impl;

import com.hugnet.activity_service.DTO.*;
import com.hugnet.activity_service.DTO.common.ActivityMapper;
import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.entity.ActivityParticipant;
import com.hugnet.activity_service.entity.ActivityParticipantId;
import com.hugnet.activity_service.entity.ActivityStatus;
import com.hugnet.activity_service.exceptions.ResourceNotFoundException;
import com.hugnet.activity_service.repository.ActivityParticipantRepository;
import com.hugnet.activity_service.repository.ActivityRepository;
import com.hugnet.activity_service.service.ActivityService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository repo;
    private final ActivityParticipantRepository participantRepo;
    private final ActivityMapper mapper;

    //GET ALL ACTIVITIES
    @Override
    public List<ActivityDTO> getAll() {

        return mapper.toDTOList(repo.findAll());
    }

    //GET ACTIVITY BY ID
    @Override
    public ActivityDTO getById(Long id) {
        Activity activity = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + id));
        return mapper.toDTO(activity);    }

    //CREATE ACTIVITY
    @Override
    public ActivityDTO createActivity(CreateActivityDTO dto) {
        Activity a = mapper.toEntity(dto);
        return mapper.toDTO(repo.save(a));
    }

    //UPDATE ACTIVITY
    @Override
    public ActivityDTO updateActivity(Long id, CreateActivityDTO dto) {
        Activity a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + id));
        Activity updated = mapper.toEntity(dto);
        updated.setActivityId(a.getActivityId());
        return mapper.toDTO(repo.save(updated));
    }

    //DELETE ACTIVITY
    @Override
    public void deleteActivity(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("No se puede eliminar. Actividad no encontrada con ID: " + id);
        repo.deleteById(id);
    }

    //GET ACTIVITIES BY COORDINATOR
    @Override
    public List<ActivityDTO> getByCoordinator(Long coordinatorId) {
        return mapper.toDTOList(repo.findByCoordinadorId(coordinatorId));
    }

    //GET PARTICIPANTS OF AN ACTIVITY
    @Override
    public List<Long> getParticipants(Long activityId) {
        return participantRepo.findByIdActivityId(activityId)
                .stream()
                .map(p -> p.getId().getUserId())
                .collect(Collectors.toList());
    }

    //JOIN ACTIVITY
    @Override
    public void joinActivity(Long activityId, Long userId) {
        // Verificar si la actividad existe
        if (!repo.existsById(activityId)) {
            throw new ResourceNotFoundException("No se puede unir a la actividad. Actividad no encontrada con ID: " + activityId);
        }
        // Verificar si el usuario ya está inscrito en la actividad
        ActivityParticipantId id = new ActivityParticipantId(activityId, userId);
        if (participantRepo.existsById(id)) {throw new IllegalArgumentException("El usuario ya está inscrito en esta actividad.");
        }
        // Registrar al usuario en la actividad
        ActivityParticipant ap = new ActivityParticipant(id);
        participantRepo.save(ap);
    }
    //UPDATE ACTIVITY STATUS
    @Override
    @Transactional
    public void updateStatus(Long activityId, ActivityStatus newStatus) {
        // 1. Buscamos la actividad o lanzamos nuestra excepción si no existe.
        Activity activity = repo.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad no encontrada con ID: " + activityId));
        // 2. Validamos que el nuevo estado sea válido (no nulo).
        if (newStatus == null) {
            throw new IllegalArgumentException("El nuevo estado no puede ser nulo.");
        }
        // 3. Actualizamos el estado y guardamos.
        activity.setEstado(newStatus);
        repo.save(activity);
    }
}