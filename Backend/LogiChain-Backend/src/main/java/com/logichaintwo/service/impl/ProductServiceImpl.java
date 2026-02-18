package com.logichaintwo.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.ProductDTO;
import com.logichaintwo.entities.Inventory;
import com.logichaintwo.entities.Product;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.InventoryRepository;
import com.logichaintwo.repository.ProductRepository;
import com.logichaintwo.service.IProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {
	private final ProductRepository repo;
	private final InventoryRepository inventoryRepository;
	private final ModelMapper mapper;

	@Override
	public List<ProductDTO> getAll() {
		List<Product> products = repo.findAll();
		List<ProductDTO> dtos = new ArrayList<>();

		for (Product product : products) {
			ProductDTO dto = mapper.map(product, ProductDTO.class);

			List<Inventory> inventories = inventoryRepository.findByProductId(product.getId());

			int total = 0;
			int reserved = 0;
			for (Inventory inv : inventories) {
				total += inv.getQuantity();
				reserved += inv.getReservedQuantity();
			}

			dto.setTotalStock(total);
			dto.setReservedStock(reserved);
			dto.setAvailableStock(total - reserved);

			dtos.add(dto);
		}

		return dtos;
	}


	@Override
	public ProductDTO getById(Long id) {
		Product product = repo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
		ProductDTO dto = mapper.map(product, ProductDTO.class);

		List<Inventory> inventories = inventoryRepository.findByProductId(id);

		int total = 0;
		int reserved = 0;
		for (Inventory inv : inventories) {
			total += inv.getQuantity();
			reserved += inv.getReservedQuantity();
		}

		dto.setTotalStock(total);
		dto.setReservedStock(reserved);
		dto.setAvailableStock(total - reserved);

		return dto;
	}

	@Override
	public List<ProductDTO> getByCreatedBy(Long userId) {
		List<Product> products = repo.findByCreatedBy(userId);
		List<ProductDTO> dtos = new ArrayList<>();

		for (Product product : products) {
			ProductDTO dto = mapper.map(product, ProductDTO.class);

			List<Inventory> inventories = inventoryRepository.findByProductId(product.getId());

			int total = 0;
			int reserved = 0;
			for (Inventory inv : inventories) {
				total += inv.getQuantity();
				reserved += inv.getReservedQuantity();
			}

			dto.setTotalStock(total);
			dto.setReservedStock(reserved);
			dto.setAvailableStock(total - reserved);

			dtos.add(dto);
		}

		return dtos;
	}

	@Override
	public ProductDTO save(Product product) {
		if (product.getId() != null) {
			Product existingProduct = repo.findById(product.getId())
					.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
			existingProduct.setName(product.getName());
			existingProduct.setSku(product.getSku());
			existingProduct.setDescription(product.getDescription());
			existingProduct.setPrice(product.getPrice());
			existingProduct.setWeight(product.getWeight());
			existingProduct.setCategory(product.getCategory());
			existingProduct.setImageUrl(product.getImageUrl());
			Product savedProduct = repo.save(existingProduct);

			ProductDTO dto = mapper.map(savedProduct, ProductDTO.class);
			List<Inventory> inventories = inventoryRepository.findByProductId(savedProduct.getId());
			int total = 0;
			int reserved = 0;
			for (Inventory inv : inventories) {
				total += inv.getQuantity();
				reserved += inv.getReservedQuantity();
			}
			dto.setTotalStock(total);
			dto.setReservedStock(reserved);
			dto.setAvailableStock(total - reserved);

			return dto;
		}
		Product savedProduct = repo.save(product);

		ProductDTO dto = mapper.map(savedProduct, ProductDTO.class);
		dto.setTotalStock(0);
		dto.setReservedStock(0);
		dto.setAvailableStock(0);

		return dto;
	}

	@Override
	public void delete(Long id) {
		Product product = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
		repo.delete(product);
	}
}