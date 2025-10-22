package hugnet.sponsor_service.service;

import hugnet.sponsor_service.dto.CreateSponsorDTO;
import hugnet.sponsor_service.dto.SponsorDTO;

public interface SponsorService {
    SponsorDTO createSponsor(CreateSponsorDTO dto);
}