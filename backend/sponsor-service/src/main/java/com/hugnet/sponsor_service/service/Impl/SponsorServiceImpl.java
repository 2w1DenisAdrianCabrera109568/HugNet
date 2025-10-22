package com.hugnet.sponsor_service.service.Impl;

import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.dto.mapper.SponsorMapper;
import com.hugnet.sponsor_service.entity.Sponsor;
import com.hugnet.sponsor_service.repository.SponsorRepository;
import com.hugnet.sponsor_service.service.SponsorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SponsorServiceImpl implements SponsorService {

    private final SponsorRepository sponsorRepository;
    private final SponsorMapper sponsorMapper;

    @Override
    public SponsorDTO createSponsor(CreateSponsorDTO dto) {
        Sponsor sponsor = sponsorMapper.toEntity(dto);
        Sponsor savedSponsor = sponsorRepository.save(sponsor);
        return sponsorMapper.toDTO(savedSponsor);
    }
}