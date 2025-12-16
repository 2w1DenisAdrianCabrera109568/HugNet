package com.hugnet.activity_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hugnet.activity_service.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByActivity_ActivityId(Long activityId);
}    

