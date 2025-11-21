package com.hugnet.report_service.service;

import java.util.List;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;

public interface ReportService {
    AttendanceReportDTO getAttendanceReport(Long activityId, String token);

    List<ReporteParticipacionDTO> getParticipationReport(String token);
}