package com.logichaintwo.service;

import com.logichaintwo.dto.CarrierDTO;
import com.logichaintwo.entities.Carrier;
import java.util.List;

public interface ICarrierService {
    List<CarrierDTO> getAll();
    CarrierDTO getById(Long id);
    CarrierDTO save(Carrier carrier);
    void delete(Long id);
}