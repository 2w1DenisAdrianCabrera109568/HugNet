package com.hugnet.activity_service.dto.common;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import com.hugnet.activity_service.dto.expense.CreateExpenseDTO;
import com.hugnet.activity_service.dto.expense.ExpenseDTO;
import com.hugnet.activity_service.entity.Expense;


@Component
public class ExpenseMapper {
    public ExpenseDTO toDTO(Expense e) {
        if (e == null) return null;
        ExpenseDTO dto = new ExpenseDTO();
        
        dto.setExpenseId(e.getExpenseId());       
        if (e.getActivity() != null) {
            dto.setActivityId(e.getActivity().getActivityId());
        }

        dto.setDescripcion(e.getDescripcion());
        dto.setMonto(e.getMonto());
        dto.setFechaGasto(e.getFechaGasto());
        dto.setNroFactura(e.getNroFactura());
        
        return dto;                       
    }

    public List<ExpenseDTO> toDTOList(List<Expense> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(this::toDTO).toList();
    }

    public Expense toEntity(CreateExpenseDTO dto) {
        if (dto == null) return null;
        Expense e = new Expense();                 
        e.setDescripcion(dto.getDescripcion());
        e.setMonto(dto.getMonto());
        e.setFechaGasto(dto.getFechaGasto());
        e.setNroFactura(dto.getNroFactura());
        
        return e;                       
    }
}
