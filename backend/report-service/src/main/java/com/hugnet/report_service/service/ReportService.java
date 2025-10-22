package com.hugnet.report_service.service;

import com.hugnet.report_service.dto.AttendanceReportDTO;

public interface ReportService {
    AttendanceReportDTO getAttendanceReport(Long activityId, String token);
}