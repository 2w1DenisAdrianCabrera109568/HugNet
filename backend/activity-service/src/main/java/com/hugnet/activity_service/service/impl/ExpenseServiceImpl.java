package com.hugnet.activity_service.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hugnet.activity_service.dto.common.ExpenseMapper;
import com.hugnet.activity_service.dto.expense.CreateExpenseDTO;
import com.hugnet.activity_service.dto.expense.ExpenseDTO;
import com.hugnet.activity_service.entity.Activity;
import com.hugnet.activity_service.entity.Expense;
import com.hugnet.activity_service.exceptions.ResourceNotFoundException;
import com.hugnet.activity_service.repository.ActivityRepository;
import com.hugnet.activity_service.repository.ExpenseRepository;
import com.hugnet.activity_service.service.ExpenseService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {
    
    private final ActivityRepository actRepo;
    private final ExpenseRepository repo;
    private final ExpenseMapper mapper;
    // Get all expenses
    @Override
    public List<ExpenseDTO> getAll() {
       
      return mapper.toDTOList(repo.findAll());
    }
    // Get expense by id
    @Override
    public ExpenseDTO getById(Long id) {
        Expense expense= repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Gastos no encontrados con ID: " + id));
        return mapper.toDTO(expense);
        
    }
    // Create expense
    @Override
    public ExpenseDTO createExpense(Long activityId, CreateExpenseDTO dto) {
 // 1. BUSCAR LA ACTIVIDAD REAL (Cambio principal)
    // No basta con saber si existe, necesitamos la instancia para vincularla.
    Activity activity = actRepo.findById(activityId)
            .orElseThrow(() -> new ResourceNotFoundException("No se puede agregar gasto. Actividad no encontrada con ID: " + activityId));

    // 2. MAPEAR DTO A ENTIDAD
    Expense e = mapper.toEntity(dto);

    // 3. VINCULAR LA RELACIÓN (Cambio principal)
    e.setActivity(activity); // JPA se encarga de guardar el ID correcto en la BD

    // Si no viene fecha, ponemos la actual
    if (e.getFechaGasto() == null) {
        e.setFechaGasto(LocalDateTime.now());
    }

    // 4. GUARDAR Y RETORNAR
    Expense savedExpense = repo.save(e);
    return mapper.toDTO(savedExpense);
    }
    // Get expenses by activity id
    @Override
    public List<ExpenseDTO> getExpenseByActivity(Long activityId) {
        
        return mapper.toDTOList(repo.findByActivity_ActivityId(activityId));
    }

  
    
}
