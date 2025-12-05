package com.hugnet.report_service.service;

import java.util.List;

import com.hugnet.report_service.dto.AttendanceReportDTO;
import com.hugnet.report_service.dto.BalanceReportDTO;
import com.hugnet.report_service.dto.ParticipantDetailDTO;
import com.hugnet.report_service.dto.ReporteParticipacionDTO;
import com.hugnet.report_service.dto.StockItemDTO;
import com.hugnet.report_service.dto.UserRankingDTO;

public interface ReportService {
    AttendanceReportDTO getAttendanceReport(Long activityId, String token);

    List<ReporteParticipacionDTO> getParticipationType(String token, String userId, String userRol);

    List<BalanceReportDTO> getBalanceReport(String token, String userId, String userRol);

    /* List<StockItemDTO> getStockReport(String token); */
    List<StockItemDTO> getStockReport(String token, String userId, String userRol);

    /*  List<UserRankingDTO> getUserRanking(String token); */
    List<UserRankingDTO> getUserRanking(String token, String userId, String userRol);

    List<ParticipantDetailDTO> getParticipantsList(Long activityId, String token, String userId, String userRol);
}