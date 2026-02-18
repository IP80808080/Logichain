package com.logichaintwo.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.logichaintwo.dto.ReturnDTO;
import com.logichaintwo.entities.Return;
import com.logichaintwo.exception.ResourceNotFoundException;
import com.logichaintwo.repository.ReturnRepository;
import com.logichaintwo.service.IReturnService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements IReturnService {
    private final ReturnRepository repo;
    private final ModelMapper mapper;

    public List<ReturnDTO> getAll() {
        return repo.findAll().stream()
                .map(e -> mapper.map(e, ReturnDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ReturnDTO getById(Long id) {
        Return returnEntity = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Return not found with id: " + id));
        return mapper.map(returnEntity, ReturnDTO.class);
    }

    @Override
    public ReturnDTO save(Return returnEntity) {
        return mapper.map(repo.save(returnEntity), ReturnDTO.class);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Return not found with id: " + id);
        }
        repo.deleteById(id);
    }
}