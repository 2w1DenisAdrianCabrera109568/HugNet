package com.hugnet.activity_service.dto;

import com.hugnet.activity_service.entity.ActivityStatus;
import lombok.Data;

@Data
public class ActivityStatusUpdateRequest {
    private ActivityStatus newStatus;
}
