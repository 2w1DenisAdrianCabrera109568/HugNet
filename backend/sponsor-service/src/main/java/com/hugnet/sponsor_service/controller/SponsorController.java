package com.hugnet.sponsor_service.controller;



import com.hugnet.sponsor_service.dto.CreateSponsorDTO;
import com.hugnet.sponsor_service.dto.SponsorDTO;
import com.hugnet.sponsor_service.service.SponsorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sponsors")
@RequiredArgsConstructor

public class SponsorController {

    private final SponsorService sponsorService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COORDINADOR', 'ADMINISTRADOR')")
    public ResponseEntity<SponsorDTO> createSponsor(@RequestBody CreateSponsorDTO dto) {
        SponsorDTO newSponsor = sponsorService.createSponsor(dto);
        return new ResponseEntity<>(newSponsor, HttpStatus.CREATED);
    }
}