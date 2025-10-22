package com.hugnet.activity_service.repository;

import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.entity.ActivityTipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTipoActividad(ActivityTipe tipoActividad);
    List<Activity> findByCoordinadorId(Long coordinadorId);

}
