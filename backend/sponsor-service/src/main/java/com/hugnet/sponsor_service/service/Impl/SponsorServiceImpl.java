package com.hugnet.sponsor_service.service.Impl;

import com.hugnet.sponsor_service.dto.AssignSponsorDTO;
import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorReportDTO;
import com.hugnet.sponsor_service.dto.mapper.SponsorMapper;
import com.hugnet.sponsor_service.entity.ActivitySponsor;
import com.hugnet.sponsor_service.entity.Sponsor;
import com.hugnet.sponsor_service.repository.ActivitySponsorRepository;
import com.hugnet.sponsor_service.repository.SponsorRepository;
import com.hugnet.sponsor_service.service.SponsorService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

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
    private final JavaMailSender mailSender;
    // ---  Crear Sponsor ---
    @Override
    public SponsorDTO createSponsor(CreateSponsorDTO dto) {
        Sponsor sponsor = sponsorMapper.toEntity(dto);
        Sponsor savedSponsor = sponsorRepository.save(sponsor);
        return sponsorMapper.toDTO(savedSponsor);
    }
    // ---  Listar Sponsors ---
    @Override
    public List<SponsorDTO> getAllSponsors() {
        return sponsorRepository.findAll().stream()
                .map(sponsorMapper::toDTO)
                .collect(Collectors.toList());
    }
    // --- Asignar Sponsor a Actividad ---
    @Override
    public void assignSponsorToActivity(Long sponsorId, AssignSponsorDTO dto, String token, String userId, String userRol) { // <--- 1. RECIBIR TOKEN
        
        Sponsor sponsor = sponsorRepository.findById(sponsorId)
                .orElseThrow(() -> new RuntimeException("Sponsor no encontrado"));

        String url = "http://activity-service:8082/api/activities/" + dto.getActivityId();
        log.info("Validando actividad en: {}", url);

        try {
            webClientBuilder.build()
                    .get()
                    .uri(url)
                    .header("Authorization", token) // <--- 2. ¡PASAR EL TOKEN AQUÍ!
                    .header("X-User-Id", userId)     // <--- EL FIX DE SEGURIDAD
                    .header("X-User-Rol", userRol)
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

    // --- US29: Generar Reporte de Aporte de Sponsors ---
    @Override
    public List<SponsorReportDTO> getSponsorReport(Long activityId) {
        // 1. Buscamos las relaciones en la tabla intermedia
        List<ActivitySponsor> aportes = activitySponsorRepository.findByActivityId(activityId);

        // 2. Mapeamos a DTO
        return aportes.stream()
                .map(aporte -> {                   
                    Sponsor sponsor = aporte.getSponsor(); 
                    
                    return new SponsorReportDTO(
                            sponsor.getSponsorId(),
                            sponsor.getNombre(),
                            sponsor.getEmail(),
                            aporte.getDescripcionAporte(),
                            sponsor.getTipo().toString()
                    );
                })
                .collect(Collectors.toList());
    }

    // --- US30: Enviar Reporte de Transparencia (REAL) ---
    @Override
    public void sendTransparencyEmail(Long activityId, Long sponsorId) {
        log.info("Iniciando envío de reporte al sponsor ID: {}", sponsorId);

        // 1. Obtener datos del aporte
        ActivitySponsor aporte = activitySponsorRepository.findByActivityId(activityId).stream()
                .filter(a -> a.getSponsor().getSponsorId().equals(sponsorId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Este sponsor no participa en esta actividad"));

        Sponsor sponsor = aporte.getSponsor();

        if (sponsor.getEmail() == null || sponsor.getEmail().isEmpty()) {
            throw new RuntimeException("El sponsor no tiene un email registrado.");
        }

        // 2. Construir el mensaje
        String asunto = "HugNet - Reporte de Transparencia: " + "Actividad #" + activityId;
        String cuerpo = "Estimado/a " + sponsor.getNombre() + ",\n\n" +
                        "Queremos agradecerte profundamente por tu colaboración en nuestra actividad solidaria.\n" +
                        "Tu aporte de: '" + aporte.getDescripcionAporte() + "' fue fundamental para el éxito del evento.\n\n" +
                        "Adjuntamos este correo como constancia de transparencia de los recursos utilizados.\n\n" +
                        "Atentamente,\n" +
                        "El equipo de HugNet.";

        // 3. Enviar el correo usando Mailtrap (JavaMailSender)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(sponsor.getEmail());
            message.setSubject(asunto);
            message.setText(cuerpo);
            message.setFrom("no-reply@hugnet.com"); // O el mail que configuraste en properties

            mailSender.send(message);
            log.info("📧 Email enviado con éxito a: {}", sponsor.getEmail());

        } catch (Exception e) {
            log.error("❌ Error al enviar email a {}", sponsor.getEmail(), e);
            throw new RuntimeException("Error al intentar enviar el correo. Verifique la configuración de Mailtrap.");
        }
    }
}

