package com.hugnet.activity_service.service;

import com.hugnet.activity_service.dto.expense.CreateExpenseDTO;
import com.hugnet.activity_service.dto.expense.ExpenseDTO;

import java.util.*;

public interface ExpenseService {
  List<ExpenseDTO> getAll();
    ExpenseDTO getById(Long id);
    ExpenseDTO createExpense(Long activityId, CreateExpenseDTO dto);
    List<ExpenseDTO> getExpenseByActivity(Long activityId);


}