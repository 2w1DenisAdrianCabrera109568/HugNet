package com.hugnet.donation_service.service;

import com.hugnet.donation_service.dto.DonationDTO;

import java.util.List;

public interface DonationService {
    List<DonationDTO> getAllDonations();
}
