package com.logichaintwo.service;

import com.logichaintwo.dto.OrderDTO;
import com.logichaintwo.entities.Order;
import java.util.List;

public interface IOrderService {
    List<OrderDTO> getAll();
    OrderDTO getById(Long id);
    List<OrderDTO> getByCustomerId(Long customerId);
    OrderDTO save(Order order);
    void delete(Long id);
    OrderDTO updateStatus(Long id, String status);
}