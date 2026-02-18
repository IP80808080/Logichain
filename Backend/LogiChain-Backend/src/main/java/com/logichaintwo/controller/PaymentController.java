package com.logichaintwo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logichaintwo.dto.ApiResponse;
import com.logichaintwo.entities.Order;
import com.logichaintwo.enums.OrderStatus;
import com.logichaintwo.enums.PaymentStatus;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.OrderRepository;
import com.logichaintwo.service.ExternalLoggerService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final OrderRepository orderRepository;
    private final ExternalLoggerService logger;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/create-session/{orderId}")
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse> createSession(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/payment-success?orderId=" + orderId)
                .setCancelUrl("http://localhost:5173/payment-cancelled?orderId=" + orderId)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount((long)(order.getTotalAmount().doubleValue() * 100)) 
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Order #" + order.getOrderNumber())
                                        .build()
                                )
                                .build()
                        )
                        .setQuantity(1L)
                        .build()
                )
                .build();

            Session session = Session.create(params);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", session.getUrl());
            
            logger.log("INFO", "Payment session created for order: " + orderId);
            
            return ResponseEntity.ok(ApiResponse.success("Session created", response));
            
        } catch (Exception e) {
            logger.log("ERROR", "Payment error: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Payment failed: " + e.getMessage()));
        }
    }

    @PostMapping("/confirm/{orderId}")
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse> confirmPayment(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            
            logger.log("INFO", "Payment confirmed for order: " + orderId);
            
            return ResponseEntity.ok(ApiResponse.success("Payment confirmed", null));
            
        } catch (Exception e) {
            logger.log("ERROR", "Confirm error: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Confirmation failed"));
        }
    }
}