package hugnet.sponsor_service.dto.mapper;


import hugnet.sponsor_service.dto.CreateSponsorDTO;
import hugnet.sponsor_service.dto.SponsorDTO;
import hugnet.sponsor_service.entity.Sponsor;
import org.springframework.stereotype.Component;

@Component
public class SponsorMapper {

    public SponsorDTO toDTO(Sponsor sponsor) {
        SponsorDTO dto = new SponsorDTO();
        dto.setSponsorId(sponsor.getSponsorId());
        dto.setNombre(sponsor.getNombre());
        dto.setTipo(sponsor.getTipo());
        dto.setEmail(sponsor.getEmail());
        dto.setTelefono(sponsor.getTelefono());
        return dto;
    }

    public Sponsor toEntity(CreateSponsorDTO dto) {
        Sponsor sponsor = new Sponsor();
        sponsor.setNombre(dto.getNombre());
        sponsor.setTipo(dto.getTipo());
        sponsor.setEmail(dto.getEmail());
        sponsor.setTelefono(dto.getTelefono());
        return sponsor;
    }
}