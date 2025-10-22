package com.hugnet.donation_service.controller;

import com.hugnet.donation_service.dto.DonationDTO;
import com.hugnet.donation_service.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR_DONACIONES', 'ADMINISTRADOR')")
    public ResponseEntity<List<DonationDTO>> getStock() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }
}