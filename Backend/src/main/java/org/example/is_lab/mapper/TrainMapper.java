package org.example.is_lab.mapper;

import org.example.is_lab.dto.TrainDTO;
import org.example.is_lab.entity.Train;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TrainMapper {
    TrainMapper INSTANCE = Mappers.getMapper(TrainMapper.class);

    TrainDTO toDTO(Train train);
    Train toEntity(TrainDTO trainDTO);
}