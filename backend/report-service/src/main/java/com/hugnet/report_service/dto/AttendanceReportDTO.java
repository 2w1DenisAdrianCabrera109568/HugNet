package com.hugnet.report_service.dto;


import lombok.Data;
import java.util.List;

@Data
public class AttendanceReportDTO {
    private Long activityId;
    private String activityTitle;
    private int totalParticipants;
    private List<Long> participantUserIds; // Lista de IDs de los usuarios
}