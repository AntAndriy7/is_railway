package org.example.is_lab.tests;

import org.example.is_lab.dto.TicketDTO;
import org.example.is_lab.entity.Ticket;
import org.example.is_lab.repository.TicketRepository;
import org.example.is_lab.services.TicketService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@SpringBootTest
@ExtendWith(SpringExtension.class)
public class TicketServiceTest {

    @MockBean
    private TicketRepository ticketRepository;

    @Autowired
    private TicketService ticketService;

    @Test
    public void testGetTicketsByOrderId() {
        Ticket ticket1 = new Ticket();
        ticket1.setId(1L);
        ticket1.setOrder_id(1L);
        ticket1.setName("John Doe");
        ticket1.setSeat_number(5);

        Ticket ticket2 = new Ticket();
        ticket2.setId(2L);
        ticket2.setOrder_id(1L);
        ticket2.setName("Jane Doe");
        ticket2.setSeat_number(6);

        when(ticketRepository.findByOrder_id(1L)).thenReturn(Arrays.asList(ticket1, ticket2));

        List<TicketDTO> tickets = ticketService.getTicketsByOrderId(1L);

        assertNotNull(tickets);
        assertEquals(2, tickets.size());
        assertEquals("John Doe", tickets.get(0).getName());
    }
}

