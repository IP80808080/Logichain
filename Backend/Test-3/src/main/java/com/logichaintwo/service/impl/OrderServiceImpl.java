package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.OrderDTO;
import com.logichaintwo.entities.Order;
import com.logichaintwo.enums.OrderStatus;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.OrderRepository;
import com.logichaintwo.service.IOrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {
    private final OrderRepository repo;
    private final ModelMapper mapper;

    @Override
    public List<OrderDTO> getAll() {
    	return repo.findAllWithCustomer().stream()
                .map(e -> mapper.map(e, OrderDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO getById(Long id) {
    	Order order = repo.findByIdWithCustomer(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapper.map(order, OrderDTO.class);
    }

    @Override
    public List<OrderDTO> getByCustomerId(Long customerId) {
        List<Order> orders = repo.findByCustomerId(customerId);
        if (orders.isEmpty()) {
            throw new ResourceNotFoundException("No orders found for customer id: " + customerId);
        }
        return orders.stream()
                .map(e -> mapper.map(e, OrderDTO.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public OrderDTO updateStatus(Long id, String status) {
        Order order = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setOrderStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + status);
        }
        
        Order updatedOrder = repo.save(order);
        return mapper.map(updatedOrder, OrderDTO.class);
    }

    @Override
    public OrderDTO save(Order order) {
        return mapper.map(repo.save(order), OrderDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }
        repo.deleteById(id);
    }
}