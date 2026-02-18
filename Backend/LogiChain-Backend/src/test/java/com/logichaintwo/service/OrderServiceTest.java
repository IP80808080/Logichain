package com.logichaintwo.service;

import com.logichaintwo.dto.OrderDTO;
import com.logichaintwo.entities.Order;
import com.logichaintwo.entities.User;
import com.logichaintwo.enums.ApprovalStatus;
import com.logichaintwo.enums.OrderStatus;
import com.logichaintwo.enums.PaymentStatus;
import com.logichaintwo.enums.Role;
import com.logichaintwo.repository.OrderRepository;
import com.logichaintwo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderServiceTest {

    @Autowired
    private IOrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testGetAll() {
        List<OrderDTO> orders = orderService.getAll();
        assertNotNull(orders);
    }

    @Test
    void testGetById() {
        User customer = new User();
        customer.setUsername("customer");
        customer.setEmail("customer@test.com");
        customer.setPassword("pass123");
        customer.setRole(Role.CUSTOMER);
        customer.setApprovalStatus(ApprovalStatus.APPROVED);
        customer = userRepository.save(customer);

        Order order = new Order();
        order.setOrderNumber("ORD-TEST");
        order.setCustomerId(customer.getId());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setTotalAmount(new BigDecimal("299.99"));
        order.setShippingAddress("123 Street");
        order.setBillingAddress("123 Street");
        order = orderRepository.save(order);

        OrderDTO found = orderService.getById(order.getId());
        assertNotNull(found);
    }

    @Test
    void testSave() {
        User customer = new User();
        customer.setUsername("customer2");
        customer.setEmail("customer2@test.com");
        customer.setPassword("pass123");
        customer.setRole(Role.CUSTOMER);
        customer.setApprovalStatus(ApprovalStatus.APPROVED);
        customer = userRepository.save(customer);

        Order order = new Order();
        order.setOrderNumber("ORD-NEW");
        order.setCustomerId(customer.getId());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setTotalAmount(new BigDecimal("399.99"));
        order.setShippingAddress("456 Avenue");
        order.setBillingAddress("456 Avenue");

        OrderDTO saved = orderService.save(order);
        assertNotNull(saved);
    }
}