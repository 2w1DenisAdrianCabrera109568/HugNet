package com.hugnet.activity_service.DTO.common;

import com.hugnet.activity_service.DTO.ActivityDTO;
import com.hugnet.activity_service.DTO.CreateActivityDTO;
import com.hugnet.activity_service.entity.Activity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ActivityMapper {

    public ActivityDTO toDTO(Activity a) {
        if (a == null) return null;
        ActivityDTO dto = new ActivityDTO();
        dto.setActivityId(a.getActivityId());
        dto.setTitulo(a.getTitulo());
        dto.setDescription(a.getDescription());
        dto.setTipoActividad(a.getTipoActividad());
        dto.setCoordinadorId(a.getCoordinadorId());
        dto.setFechaInicio(a.getFechaInicio() != null ? a.getFechaInicio().toString() : null);
        dto.setFechaFin(a.getFechaFin() != null ? a.getFechaFin().toString() : null);
        return dto;
    }

    public List<ActivityDTO> toDTOList(List<Activity> list) {
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Activity toEntity(CreateActivityDTO dto) {
        if (dto == null) return null;
        Activity a = new Activity();
        a.setTitulo(dto.getTitulo());
        a.setDescription(dto.getDescription());
        a.setTipoActividad(dto.getTipoActividad());
        a.setCoordinadorId(dto.getCoordinadorId());
        if (dto.getFechaInicio() != null && !dto.getFechaInicio().isEmpty())
            a.setFechaInicio(LocalDate.parse(dto.getFechaInicio()));
        if (dto.getFechaFin() != null && !dto.getFechaFin().isEmpty())
            a.setFechaFin(LocalDate.parse(dto.getFechaFin()));
        return a;
    }
}

