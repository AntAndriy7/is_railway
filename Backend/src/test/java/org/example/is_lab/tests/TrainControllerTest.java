package org.example.is_lab.tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.is_lab.controllers.TrainController;
import org.example.is_lab.dto.TrainDTO;
import org.example.is_lab.services.TrainService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Date;
import java.sql.Time;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
@WebMvcTest(TrainController.class)
class TrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrainService trainService;

    @Test
    void testGetAllTrains_ReturnsListOfTrains() throws Exception {
        List<TrainDTO> trains = List.of(new TrainDTO(1L, 1L, "123A", "City A", "City B", Time.valueOf("08:00:00"),
                Time.valueOf("12:00:00"), Date.valueOf("2024-12-01"), Date.valueOf("2024-12-01"), true, 200, 100, 50));

        Mockito.when(trainService.getAllTrains()).thenReturn(trains);

        mockMvc.perform(get("/api/train"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].train_number").value("123A"));
    }

    @Test
    void testGetTrainById_ReturnsTrain() throws Exception {
        TrainDTO train = new TrainDTO(1L, 1L, "123A", "City A", "City B", Time.valueOf("08:00:00"),
                Time.valueOf("12:00:00"), Date.valueOf("2024-12-01"), Date.valueOf("2024-12-01"), true, 200, 100, 50);

        Mockito.when(trainService.getTrain(1L)).thenReturn(train);

        mockMvc.perform(get("/api/train/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.train_number").value("123A"));
    }

    @Test
    void testGetTrainById_NotFound() throws Exception {
        Mockito.when(trainService.getTrain(1L)).thenReturn(null);

        mockMvc.perform(get("/api/train/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateTrain_ReturnsCreatedTrain() throws Exception {
        TrainDTO trainToCreate = new TrainDTO(0L, 1L, "123A", "City A", "City B", Time.valueOf("08:00:00"),
                Time.valueOf("12:00:00"), Date.valueOf("2024-12-01"), Date.valueOf("2024-12-01"), true, 200, 100, 50);

        TrainDTO createdTrain = new TrainDTO(1L, 1L, "123A", "City A", "City B", Time.valueOf("08:00:00"),
                Time.valueOf("12:00:00"), Date.valueOf("2024-12-01"), Date.valueOf("2024-12-01"), true, 200, 100, 50);

        Mockito.when(trainService.createTrain(Mockito.any(TrainDTO.class))).thenReturn(createdTrain);

        mockMvc.perform(post("/api/train")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(trainToCreate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.train_number").value("123A"));
    }
}

