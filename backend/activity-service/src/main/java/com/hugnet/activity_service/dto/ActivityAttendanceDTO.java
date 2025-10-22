package com.hugnet.activity_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder // Usaremos un builder para construirlo fácilmente
public class ActivityAttendanceDTO {
    private Long activityId;
    private String activityTitle;
    private int totalParticipants;
    private List<Long> participantUserIds;
}