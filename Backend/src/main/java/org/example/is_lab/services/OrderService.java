package org.example.is_lab.services;

import lombok.RequiredArgsConstructor;
import org.example.is_lab.entity.Ticket;
import org.example.is_lab.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.example.is_lab.dto.OrderDTO;
import org.example.is_lab.entity.Order;
import org.example.is_lab.entity.Train;
import org.example.is_lab.mapper.OrderMapper;
import org.example.is_lab.repository.OrderRepository;
import org.example.is_lab.repository.TrainRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final TrainRepository trainRepository;
    private final TicketRepository ticketRepository;
    private final OrderMapper mapper = OrderMapper.INSTANCE;

    public List<OrderDTO> getOrdersByClientId(Long clientId) {
        return orderRepository.findByClient_id(clientId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO addOrder(OrderDTO orderDTO, List<String> names) {
        Train train = trainRepository.findById(orderDTO.getTrain_id())
                .orElseThrow(() -> new IllegalArgumentException("Train not found with ID: " + orderDTO.getTrain_id()));

        List<Long> occupiedSeats = getOccupiedSeatsForTrain(train.getId());
        long availableSeats = train.getSeats() - occupiedSeats.size();
        if (availableSeats < names.size())
            throw new IllegalArgumentException("Not enough seats available.");

        if (names.isEmpty())
            throw new IllegalArgumentException("Name list cannot be empty.");

        Order order = mapper.toEntity(orderDTO);
        order = orderRepository.save(order);

        List<Long> availableSeatNumbers = new ArrayList<>();
        for (long i = 1; i <= train.getSeats(); i++) {
            if (!occupiedSeats.contains(i)) {
                availableSeatNumbers.add(i);
            }
        }

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) {
            Ticket ticket = new Ticket();
            ticket.setOrder_id(order.getId());
            ticket.setName(names.get(i));
            ticket.setSeat_number(availableSeatNumbers.get(i));
            tickets.add(ticket);
            train.setOccupied_seats(train.getOccupied_seats() + 1);
        }

        ticketRepository.saveAll(tickets);
        trainRepository.save(train);

        return mapper.toDTO(order);
    }

    public List<Long> getOccupiedSeatsForTrain(Long trainId) {
        List<Order> orders = orderRepository.findByTIdPS(trainId, Arrays.asList("booked", "paid"));
        List<Long> occupiedSeats = new ArrayList<>();

        for (Order order : orders) {
            List<Ticket> tickets = ticketRepository.findByOrder_id(order.getId());
            for (Ticket ticket : tickets) {
                occupiedSeats.add(ticket.getSeat_number());
            }
        }

        return occupiedSeats;
    }

    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        return orderRepository.findById(id).map(existingOrder -> {
            if (orderDTO.getClient_id() != 0) {
                existingOrder.setClient_id(orderDTO.getClient_id());
            }
            if (orderDTO.getTrain_id() != 0) {
                existingOrder.setTrain_id(orderDTO.getTrain_id());
            }
            if (orderDTO.getTicket_quantity() != 0) {
                existingOrder.setTicket_quantity(orderDTO.getTicket_quantity());
            }
            if (orderDTO.getTotal_price() != 0) {
                existingOrder.setTotal_price(orderDTO.getTotal_price());
            }
            if (orderDTO.getPayment_status() != null) {
                existingOrder.setPayment_status(orderDTO.getPayment_status());
            }
            return mapper.toDTO(orderRepository.save(existingOrder));
        }).orElse(null);
    }
}