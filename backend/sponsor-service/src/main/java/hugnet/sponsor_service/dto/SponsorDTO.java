package hugnet.sponsor_service.dto;


import hugnet.sponsor_service.entity.SponsorType;
import lombok.Data;

@Data
public class SponsorDTO {
    private Long sponsorId;
    private String nombre;
    private SponsorType tipo;
    private String email;
    private String telefono;
}