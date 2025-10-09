package com.hugnet.activity_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityParticipant {

    @EmbeddedId
    private ActivityParticipantId id;
}