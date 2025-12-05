package com.hugnet.activity_service.repository;

import com.hugnet.activity_service.dto.ActivityTypeReportDTO;
import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.entity.ActivityTipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTipoActividad(ActivityTipe tipoActividad);
    List<Activity> findByCoordinadorId(Long coordinadorId);
    
    // Other query methods...
@Query("SELECT new com.hugnet.activity_service.dto.ActivityTypeReportDTO(" +
           "       a.tipoActividad, " +
           "       COUNT(DISTINCT a), " +
           "       COUNT(p)) " +
           "FROM Activity a " +
           "LEFT JOIN ActivityParticipant p ON a.activityId = p.id.activityId " +
           "GROUP BY a.tipoActividad")
    List<ActivityTypeReportDTO> getParticipationStatsByType();

}
