package com.hugnet.sponsor_service.service.Impl;

import com.hugnet.sponsor_service.dto.AssignSponsorDTO;
import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.dto.mapper.SponsorMapper;
import com.hugnet.sponsor_service.entity.ActivitySponsor;
import com.hugnet.sponsor_service.entity.Sponsor;
import com.hugnet.sponsor_service.repository.ActivitySponsorRepository;
import com.hugnet.sponsor_service.repository.SponsorRepository;
import com.hugnet.sponsor_service.service.SponsorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class SponsorServiceImpl implements SponsorService {

    private final SponsorRepository sponsorRepository;
    private final SponsorMapper sponsorMapper;
    private final WebClient.Builder webClientBuilder;
    private final ActivitySponsorRepository activitySponsorRepository;

    @Override
    public SponsorDTO createSponsor(CreateSponsorDTO dto) {
        Sponsor sponsor = sponsorMapper.toEntity(dto);
        Sponsor savedSponsor = sponsorRepository.save(sponsor);
        return sponsorMapper.toDTO(savedSponsor);
    }

 @Override
    public void assignSponsorToActivity(Long sponsorId, AssignSponsorDTO dto, String token) { // <--- 1. RECIBIR TOKEN
        
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new RuntimeException("Sponsor no encontrado"));

        String url = "http://activity-service:8082/api/activities/" + dto.getActivityId();
        log.info("Validando actividad en: {}", url);

        try {
            webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("Authorization", token) // <--- 2. ¡PASAR EL TOKEN AQUÍ!
                    .retrieve()
                    // Mejoramos el manejo de errores para no confundirnos en el futuro
                    .onStatus(
                        status -> status.value() == 404, 
                        response -> Mono.error(new RuntimeException("La actividad " + dto.getActivityId() + " no existe."))
                    )
                    .onStatus(
                        status -> status.value() == 403 || status.value() == 401,
                        response -> Mono.error(new RuntimeException("Error de permisos al validar actividad."))
                    )
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Error validando actividad: {}", e.getMessage());
            // Re-lanzamos la excepción para que el Controller devuelva el error correcto
            throw new RuntimeException(e.getMessage());
        }

        ActivitySponsor asignacion = ActivitySponsor.builder()
                .sponsor(sponsor)
                .activityId(dto.getActivityId())
                .descripcionAporte(dto.getDescripcionAporte())
                .build();

        activitySponsorRepository.save(asignacion);
    }
}