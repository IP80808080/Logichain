package com.logichaintwo.service;

import com.logichaintwo.dto.ReturnDTO;
import com.logichaintwo.entities.Return;
import java.util.List;

public interface IReturnService {
    List<ReturnDTO> getAll();
    ReturnDTO getById(Long id);
    ReturnDTO save(Return returnEntity);
    void delete(Long id);
}