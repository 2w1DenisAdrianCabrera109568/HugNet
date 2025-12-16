package com.hugnet.activity_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hugnet.activity_service.dto.expense.CreateExpenseDTO;
import com.hugnet.activity_service.dto.expense.ExpenseDTO;

import com.hugnet.activity_service.service.ExpenseService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    
    private final ExpenseService ExpenseService;
    
    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses() {
        return ResponseEntity.ok(ExpenseService.getAll());
    }

   // Endpoint para el MODAL del Frontend - GASTOS
    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@PathVariable Long activityId, @RequestBody CreateExpenseDTO dto) {
        return ResponseEntity.ok(ExpenseService.createExpense(activityId, dto));
    }

    // Endpoint para el REPORT-SERVICE
    @GetMapping("/by-activity/{activityId}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByActivity(@PathVariable Long activityId) {
        return ResponseEntity.ok(ExpenseService.getExpenseByActivity(activityId));
    }  
}
