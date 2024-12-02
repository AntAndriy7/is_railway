package org.example.is_lab.services;

import lombok.RequiredArgsConstructor;
import org.example.is_lab.entity.Order;
import org.example.is_lab.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.example.is_lab.dto.TrainDTO;
import org.example.is_lab.entity.Train;
import org.example.is_lab.mapper.TrainMapper;
import org.example.is_lab.repository.TrainRepository;

import java.sql.Date;
import java.sql.Time;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainService {

    private final TrainRepository trainRepository;
    private final OrderRepository orderRepository;
    private final TrainMapper mapper = TrainMapper.INSTANCE;

    public TrainDTO getTrain(Long id) {
        return trainRepository.findById(id)
                .map(mapper::toDTO)
                .orElse(null);
    }

    public List<TrainDTO> getAllTrains() {
        checkTrainsStatuses();
        return trainRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<TrainDTO> getTrainsByStatus() {
        checkTrainsStatuses();
        return trainRepository.findByStatus(true).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<TrainDTO> getTrainsByRailwayId(Long railwayId) {
        checkTrainsStatuses();
        return trainRepository.findByRailwayId(railwayId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    private void checkTrainsStatuses() {
        List<Train> trains = trainRepository.findAll();
        Date currentDate = new Date(System.currentTimeMillis());
        Time currentTime = new Time(System.currentTimeMillis());

        for (Train train : trains) {
            // Якщо дата і час вильоту вже минули, оновлюємо статус на false
            if ((train.getDeparture_date().before(currentDate)) ||
                    (train.getDeparture_date().equals(currentDate) && train.getDeparture_time().before(currentTime))) {
                if (train.isStatus()) {
                    train.setStatus(false);
                    trainRepository.save(train);
                }
            }
        }
    }

    public TrainDTO createTrain(TrainDTO trainDTO) {
        Train train = mapper.toEntity(trainDTO);
        train.setStatus(true);
        train = trainRepository.save(train);
        return mapper.toDTO(train);
    }

    public TrainDTO updateTrain(Long id, TrainDTO trainDTO) {
        return trainRepository.findById(id).map(existingTrain -> {
            if (trainDTO.getRailway_id() != 0) {
                existingTrain.setRailway_id(trainDTO.getRailway_id());
            }
            if (trainDTO.getTrain_number() != null) {
                existingTrain.setTrain_number(trainDTO.getTrain_number());
            }
            if (trainDTO.getDeparture() != null) {
                existingTrain.setDeparture(trainDTO.getDeparture());
            }
            if (trainDTO.getDestination() != null) {
                existingTrain.setDestination(trainDTO.getDestination());
            }
            if (trainDTO.getDeparture_time() != null) {
                existingTrain.setDeparture_time(trainDTO.getDeparture_time());
            }
            if (trainDTO.getArrival_time() != null) {
                existingTrain.setArrival_time(trainDTO.getArrival_time());
            }
            if (trainDTO.getDeparture_date() != null) {
                existingTrain.setDeparture_date(trainDTO.getDeparture_date());
            }
            if (trainDTO.getArrival_date() != null) {
                existingTrain.setArrival_date(trainDTO.getArrival_date());
            }
            if (trainDTO.getTicket_price() != 0) {
                existingTrain.setTicket_price(trainDTO.getTicket_price());
            }
            if (trainDTO.getSeats() != 0) {
                existingTrain.setSeats(trainDTO.getSeats());
            }
            if (trainDTO.getOccupied_seats() != 0) {
                existingTrain.setOccupied_seats(trainDTO.getOccupied_seats());
            }
            trainRepository.save(existingTrain);
            return mapper.toDTO(existingTrain);
        }).orElse(null);
    }

    public TrainDTO statusTrain(Long id) {
        return trainRepository.findById(id).map(existingTrain -> {
            existingTrain.setStatus(false);
            trainRepository.save(existingTrain);

            // Змінюємо статус усіх ордерів на "canceled"
            List<Order> orders = orderRepository.findByTrain_id(id);
            for (Order order : orders) {
                order.setPayment_status("canceled");
            }
            orderRepository.saveAll(orders);

            return mapper.toDTO(existingTrain);
        }).orElse(null);
    }
}
