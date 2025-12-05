package com.hugnet.sponsor_service.service;

import java.util.List;

import com.hugnet.sponsor_service.dto.AssignSponsorDTO;
import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorReportDTO;

public interface SponsorService {
    SponsorDTO createSponsor(CreateSponsorDTO dto);
    List<SponsorDTO> getAllSponsors();

    void assignSponsorToActivity(Long sponsorId, AssignSponsorDTO dto, String token, String userId, String userRol);

    List<SponsorReportDTO> getSponsorReport(Long activityId);

    void sendTransparencyEmail(Long activityId, Long sponsorId);
}