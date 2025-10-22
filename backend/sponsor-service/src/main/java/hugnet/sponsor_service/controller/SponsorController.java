package hugnet.sponsor_service.controller;



import hugnet.sponsor_service.dto.CreateSponsorDTO;
import hugnet.sponsor_service.dto.SponsorDTO;
import hugnet.sponsor_service.service.SponsorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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