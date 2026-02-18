package com.logichaintwo.service;

import com.logichaintwo.dto.ProductDTO;
import com.logichaintwo.entities.Product;
import com.logichaintwo.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ProductServiceTest {

    @Autowired
    private IProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testGetAll() {
        List<ProductDTO> products = productService.getAll();
        assertNotNull(products);
    }

    @Test
    void testGetById() {
        Product product = new Product();
        product.setName("Test Product");
        product.setSku("SKU-TEST");
        product.setPrice(new BigDecimal("99.99"));
        product.setWeight(2.5);
        product = productRepository.save(product);
        
        ProductDTO found = productService.getById(product.getId());
        assertNotNull(found);
    }

    @Test
    void testSave() {
        Product product = new Product();
        product.setName("New Product");
        product.setSku("SKU-NEW");
        product.setPrice(new BigDecimal("149.99"));
        product.setWeight(3.5);
        
        ProductDTO saved = productService.save(product);
        assertNotNull(saved);
    }
}