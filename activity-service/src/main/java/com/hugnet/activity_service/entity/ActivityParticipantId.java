package com.hugnet.activity_service.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityParticipantId implements Serializable {
    private Long activityId;
    private Long userId;

    @Override
    public int hashCode() {
        return Objects.hash(activityId, userId);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ActivityParticipantId)) return false;
        ActivityParticipantId that = (ActivityParticipantId) o;
        return Objects.equals(activityId, that.activityId) && Objects.equals(userId, that.userId);
    }

}
