package com.hugnet.report_service.dto;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActivityAttendanceData {
       private Long activityId;
        private String activityTitle;
        private int totalParticipants;
        private List<Long> participantUserIds; 
}
