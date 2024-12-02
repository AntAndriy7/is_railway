package org.example.is_lab.tests;

import org.example.is_lab.dto.OrderDTO;
import org.example.is_lab.entity.Order;
import org.example.is_lab.entity.Train;
import org.example.is_lab.repository.OrderRepository;
import org.example.is_lab.repository.TicketRepository;
import org.example.is_lab.repository.TrainRepository;
import org.example.is_lab.services.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@SpringBootTest
@ExtendWith(SpringExtension.class)
public class OrderServiceTest {

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private TrainRepository trainRepository;

    @MockBean
    private TicketRepository ticketRepository;

    @Autowired
    private OrderService orderService;

    @Test
    public void testAddOrderSuccess() {
        Train train = new Train();
        train.setId(1L);
        train.setSeats(100);
        train.setOccupied_seats(0);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setClient_id(1L);
        orderDTO.setTrain_id(1L);
        orderDTO.setTicket_quantity(2);
        orderDTO.setTotal_price(500);

        List<String> names = Arrays.asList("John Doe", "Jane Doe");

        when(trainRepository.findById(1L)).thenReturn(Optional.of(train));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderDTO result = orderService.addOrder(orderDTO, names);

        assertNotNull(result);
        assertEquals(1L, result.getTrain_id());
        verify(ticketRepository, times(1)).saveAll(anyList());
    }

    @Test
    public void testAddOrderNoSeatsAvailable() {
        Train train = new Train();
        train.setId(1L);
        train.setSeats(1); // Only 1 seat available
        train.setOccupied_seats(1);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setClient_id(1L);
        orderDTO.setTrain_id(1L);
        orderDTO.setTicket_quantity(2);

        List<String> names = Arrays.asList("John Doe", "Jane Doe");

        when(trainRepository.findById(1L)).thenReturn(Optional.of(train));

        assertThrows(IllegalArgumentException.class, () -> {
            orderService.addOrder(orderDTO, names);
        });
    }
}

