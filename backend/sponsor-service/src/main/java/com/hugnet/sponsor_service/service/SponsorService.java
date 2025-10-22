package com.hugnet.sponsor_service.service;

import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;

public interface SponsorService {
    SponsorDTO createSponsor(CreateSponsorDTO dto);
}