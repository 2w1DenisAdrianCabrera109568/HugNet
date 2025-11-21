package com.hugnet.donation_service.service.impl;

import com.hugnet.donation_service.dto.CreateDonationDTO;
import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.dto.mapper.DonationMapper;
import com.hugnet.donation_service.entity.Donation;
import com.hugnet.donation_service.entity.DonationStatus;
import com.hugnet.donation_service.entity.DonationType;
import com.hugnet.donation_service.entity.ItemType;
import com.hugnet.donation_service.entity.PaymentStatus;
import com.hugnet.donation_service.exceptions.ResourceNotFoundException;
import com.hugnet.donation_service.repository.DonationRepository;
import com.hugnet.donation_service.service.DonationService;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;



import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final DonationMapper donationMapper;

    // Inyectamos el token desde application.yml
    @Value("${mercadopago.access.token}")
    private String mercadoPagoAccessToken;
    // Inicializamos la configuración de MercadoPago al arrancar el servicio
    @PostConstruct
    public void initMercadoPago() {
        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
    }

    @Override
    public List<DonationDTO> getAllDonations() {
        return donationRepository.findAll()
                .stream()
                .map(donationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- HU-12: Un usuario ofrece una nueva donación en especie (BIEN o SERVICIO) --- Actualizado a Sprint 4

 @Override
    public DonationDTO createDonation(CreateDonationDTO dto, Long donanteId) {
        
        // 1. Validación y Creación según el tipo
        Donation newDonation = donationMapper.toEntity(dto);
        newDonation.setDonanteId(donanteId);
        newDonation.setEstado(DonationStatus.PENDIENTE); // Estado de negocio inicial

        if (dto.getTipoDonacion() == DonationType.ESPECIE) {
            handleEspecieValidation(dto, newDonation);
        } else if (dto.getTipoDonacion() == DonationType.MONETARIA) {
            handleMonetaryValidation(dto, newDonation);
        }

        // 2. Guardado inicial en BD (para tener ID)
        Donation savedDonation = donationRepository.save(newDonation);

        // 3. Si es MONETARIA, contactar a MercadoPago
        String preferenceUrl = null;
        if (savedDonation.getTipoDonacion() == DonationType.MONETARIA) {
            try {
                // Creamos la preferencia y obtenemos la URL
                Preference preference = createMercadoPagoPreference(savedDonation);
                
                // Guardamos el ID de la preferencia en nuestra BD para referencia futura
                savedDonation.setPaymentGatewayId(preference.getId());
                savedDonation = donationRepository.save(savedDonation);
                
                // Obtenemos la URL para el frontend (Sandbox o Producción según config)
                preferenceUrl = preference.getSandboxInitPoint(); // Usamos Sandbox para pruebas
                
            } catch (Exception e) {
                // Si falla MP, marcamos como error o lanzamos excepción.
                // Por ahora lanzamos Runtime para simplificar, pero en prod se maneja mejor.
                throw new RuntimeException("Error al contactar con MercadoPago: " + e.getMessage());
            }
        }

        // 4. Retorno
        DonationDTO responseDTO = donationMapper.toDTO(savedDonation);
        responseDTO.setPaymentUrl(preferenceUrl); // Insertamos la URL en la respuesta
        return responseDTO;
    }

    // --- Métodos Privados de Validación (Clean Code) ---

    private void handleEspecieValidation(CreateDonationDTO dto, Donation entity) {
        entity.setPaymentStatus(PaymentStatus.NA); // No aplica pago

        if (dto.getItemType() == ItemType.BIEN && (dto.getCantidad() == null || dto.getCantidad() < 1)) {
            throw new IllegalArgumentException("Para donar un BIEN, la cantidad debe ser al menos 1.");
        }
        if (dto.getItemType() == ItemType.SERVICIO) {
            entity.setCantidad(1);
        }
    }

    private void handleMonetaryValidation(CreateDonationDTO dto, Donation entity) {
        if (dto.getMonto() == null || dto.getMonto() <= 0) {
            throw new IllegalArgumentException("El monto es obligatorio y debe ser positivo para donaciones monetarias.");
        }
        // Inicializamos estado de pago
        entity.setPaymentStatus(PaymentStatus.PENDIENTE_PAGO);
    }

    // --- Integración con MercadoPago (HU-14) ---

private Preference createMercadoPagoPreference(Donation donation) {
        log.info("--> Iniciando creación de preferencia MP para Donación ID: {}", donation.getId());

        try {
            // 1. Crear el ítem
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(donation.getId().toString())
                    .title("Donación HugNet")
                    .description("Donación voluntaria")
                    .quantity(1)
                    .currencyId("ARS")
                    .unitPrice(BigDecimal.valueOf(donation.getMonto()))
                    .build();

            // 2. URLs de retorno (DEFINIMOS EL OBJETO)
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:5500/dashboard.html?status=success")
                    .pending("http://localhost:5500/dashboard.html?status=pending")
                    .failure("http://localhost:5500/dashboard.html?status=failure")
                    .build();

            // 3. Solicitud completa (USAMOS EL OBJETO)
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(itemRequest))
                    .backUrls(backUrls)       
                    //.autoReturn("approved")   // Esto requiere que backUrls esté definido arriba
                    .externalReference(donation.getId().toString())
                    .build();

            log.info("Enviando solicitud a MercadoPago... BackUrls configuradas: {}", 
                    preferenceRequest.getBackUrls() != null ? "SÍ" : "NO (ERROR)");

            // 4. Cliente y Envío
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            log.info("<-- Preferencia creada con éxito. ID: {}", preference.getId());
            return preference;

        } catch (MPApiException ex) {
            log.error("🚨 ERROR API MERCADOPAGO 🚨 StatusCode: {}", ex.getStatusCode());
            log.error("Respuesta JSON: {}", ex.getApiResponse().getContent());
            throw new RuntimeException("Error API MercadoPago: " + ex.getMessage());
        } catch (Exception ex) {
            log.error("🚨 ERROR GENERAL 🚨", ex);
            throw new RuntimeException("Error al procesar pago: " + ex.getMessage());
        }
    }

   @Override
    public void processPaymentNotification(String topic, Long id) {
        // Solo nos interesan las notificaciones de tipo "payment"
        if (!"payment".equals(topic) && !"merchant_order".equals(topic)) {
             // Nota: En producción a veces MP manda 'merchant_order', 
             // para este MVP nos enfocamos en 'payment' que es lo directo.
            return; 
        }
        
        try {
            if ("payment".equals(topic)) {
                // 1. Consultar a MercadoPago los detalles del pago usando el ID que nos mandaron
                PaymentClient client = new PaymentClient();
                Payment payment = client.get(id);

                // 2. Obtener nuestra referencia (El ID de la donación que enviamos al crear la preferencia)
                String externalReference = payment.getExternalReference();
                if (externalReference == null) {
                    System.out.println("Pago sin referencia externa, ignorando...");
                    return;
                }

                Long donationId = Long.parseLong(externalReference);

                // 3. Buscar la donación en nuestra BD
                Donation donation = donationRepository.findById(donationId)
                        .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada para el pago: " + id));

                // 4. Verificar el estado del pago real
                String status = payment.getStatus();
                
                if ("approved".equals(status)) {
                    // ¡ÉXITO! El dinero entró.
                    donation.setPaymentStatus(PaymentStatus.APROBADO);
                    donation.setEstado(DonationStatus.APROBADA); // La donación es válida
                    
                    // Aquí podrías guardar el ID del PAGO real (diferente a la preferencia) si quisieras
                    // donation.setPaymentIdReal(id.toString()); 
                } else if ("rejected".equals(status) || "cancelled".equals(status)) {
                    donation.setPaymentStatus(PaymentStatus.RECHAZADO);
                    // No cambiamos el estado general a RECHAZADA aún, damos chance de reintentar
                } else {
                    donation.setPaymentStatus(PaymentStatus.EN_PROCESO);
                }

                // 5. Guardar cambios
                donationRepository.save(donation);
                System.out.println("Donación " + donationId + " actualizada con estado de pago: " + status);
            }
        } catch (Exception e) {
            // Loguear el error pero no lanzar excepción para que MP no siga reintentando infinitamente si es error nuestro
            e.printStackTrace(); 
            System.err.println("Error procesando webhook de MP: " + e.getMessage());
        }
    } 
    
    
    // --- ¡NUEVAS IMPLEMENTACIONES DE HU-13! ---

    @Override
    public List<DonationDTO> getPendingDonations() {
        // 1. Busca solo las PENDIENTE
        List<Donation> pending = donationRepository.findByEstado(DonationStatus.PENDIENTE);

        // 2. Mapea y devuelve
        return pending.stream()
                .map(donationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DonationDTO approveDonation(Long donationId, Long gestorId) {
        // Reutilizamos la lógica de "updateStatus"
        return updateDonationStatus(donationId, DonationStatus.APROBADA, gestorId);
    }

    @Override
    public DonationDTO rejectDonation(Long donationId, Long gestorId) {
        // Reutilizamos la lógica de "updateStatus"
        return updateDonationStatus(donationId, DonationStatus.RECHAZADA, gestorId);
    }

    /**
     * Método privado de ayuda para aprobar o rechazar.
     */
    private DonationDTO updateDonationStatus(Long donationId, DonationStatus newStatus, Long gestorId) {
        // (En un futuro, el gestorId se podría guardar para auditoría)

        // 1. Buscar la donación
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donación no encontrada con ID: " + donationId));

        // 2. Validar Lógica de Negocio
        if (donation.getEstado() != DonationStatus.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden aprobar o rechazar donaciones que estén PENDIENTES.");
        }

        // 3. Aplicar el cambio
        donation.setEstado(newStatus);

        // 4. Guardar y devolver
        Donation savedDonation = donationRepository.save(donation);
        return donationMapper.toDTO(savedDonation);
    }
}