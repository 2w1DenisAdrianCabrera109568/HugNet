package com.hugnet.activity_service.service.impl;

import com.hugnet.activity_service.DTO.*;
import com.hugnet.activity_service.DTO.common.ActivityMapper;
import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.entity.ActivityParticipant;
import com.hugnet.activity_service.entity.ActivityParticipantId;
import com.hugnet.activity_service.repository.ActivityParticipantRepository;
import com.hugnet.activity_service.repository.ActivityRepository;
import com.hugnet.activity_service.service.ActivityService;
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

    @Override
    public List<ActivityDTO> getAll() {
        return mapper.toDTOList(repo.findAll());
    }

    @Override
    public ActivityDTO getById(Long id) {
        return mapper.toDTO(repo.findById(Math.toIntExact(id)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Override
    public ActivityDTO create(CreateActivityDTO dto) {
        Activity a = mapper.toEntity(dto);
        return mapper.toDTO(repo.save(a));
    }

    @Override
    public ActivityDTO update(Long id, CreateActivityDTO dto) {
        Activity a = repo.findById(Math.toIntExact(id)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Activity updated = mapper.toEntity(dto);
        // keep id
        updated.setActivityId(a.getActivityId());
        return mapper.toDTO(repo.save(updated));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(Math.toIntExact(id))) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repo.deleteById(Math.toIntExact(id));
    }

    @Override
    public List<ActivityDTO> getByCoordinator(Long coordinatorId) {
        return mapper.toDTOList(repo.findByCoordinadorId(coordinatorId));
    }

    @Override
    public List<Long> getParticipants(Long activityId) {
        return participantRepo.findByIdActivityId(activityId)
                .stream()
                .map(p -> p.getId().getUserId())
                .collect(Collectors.toList());
    }

    @Override
    public void joinActivity(Long activityId, Long userId) {
        // Prevent duplicates
        ActivityParticipantId id = new ActivityParticipantId(activityId, userId);
        if (participantRepo.existsById(id)) return;
        // Optionally validate activity exists
        if (!repo.existsById(Math.toIntExact(activityId))) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found");
        ActivityParticipant ap = new ActivityParticipant(id);
        participantRepo.save(ap);
    }
}