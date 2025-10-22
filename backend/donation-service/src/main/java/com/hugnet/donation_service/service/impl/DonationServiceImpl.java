package com.hugnet.donation_service.service.impl;

import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.dto.mapper.DonationMapper;
import com.hugnet.donation_service.repository.DonationRepository;
import com.hugnet.donation_service.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final DonationMapper donationMapper;

    @Override
    public List<DonationDTO> getAllDonations() {
        return donationRepository.findAll()
                .stream()
                .map(donationMapper::toDTO)
                .collect(Collectors.toList());
    }
}