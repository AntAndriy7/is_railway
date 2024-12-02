package org.example.is_lab.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.is_lab.dto.TrainDTO;
import org.example.is_lab.services.TrainService;

import java.util.List;

@RestController
@RequestMapping(value = "/api/train")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @GetMapping
    public ResponseEntity<List<TrainDTO>> getAllTrains() {
        List<TrainDTO> trains = trainService.getAllTrains();
        return ResponseEntity.ok(trains);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainDTO> getTrain(@PathVariable Long id) {
        TrainDTO train = trainService.getTrain(id);
        if (train == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(train);
    }

    @GetMapping("/status")
    public ResponseEntity<List<TrainDTO>> getTrainsByStatus() {
        List<TrainDTO> trains = trainService.getTrainsByStatus();
        return trains.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(trains);
    }

    @GetMapping("/railway/{railwayId}")
    public ResponseEntity<List<TrainDTO>> getTrainsByRailwayId(@PathVariable Long railwayId) {
        List<TrainDTO> trains = trainService.getTrainsByRailwayId(railwayId);
        return trains.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(trains);
    }

    @PostMapping
    public ResponseEntity<TrainDTO> createTrain(@RequestBody TrainDTO trainDTO) {
        TrainDTO createdTrain = trainService.createTrain(trainDTO);
        return ResponseEntity.ok(createdTrain);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainDTO> updateTrain(@PathVariable Long id, @RequestBody TrainDTO trainDTO) {
        TrainDTO updatedTrainData = trainService.updateTrain(id, trainDTO);
        if (updatedTrainData == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updatedTrainData);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<TrainDTO> toggleTrainStatus(@PathVariable Long id) {
        TrainDTO updatedTrain = trainService.statusTrain(id);
        if (updatedTrain == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedTrain);
    }
}

