package com.logichaintwo.service;

import com.logichaintwo.dto.ProductDTO;
import com.logichaintwo.entities.Product;
import java.util.List;

public interface IProductService {
    List<ProductDTO> getAll();
    ProductDTO getById(Long id);
    ProductDTO save(Product product);
    void delete(Long id);
    List<ProductDTO> getByCreatedBy(Long userId);
}