package org.example.is_lab.tests;

import org.example.is_lab.controllers.TicketController;
import org.example.is_lab.dto.TicketDTO;
import org.example.is_lab.services.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(TicketController.class)
public class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TicketService ticketService;

    @Test
    public void testGetTicketsByOrderId() throws Exception {
        TicketDTO ticket1 = new TicketDTO(1L, 1L, "John Doe", 5L);
        TicketDTO ticket2 = new TicketDTO(2L, 1L, "Jane Doe", 6L);

        when(ticketService.getTicketsByOrderId(1L)).thenReturn(Arrays.asList(ticket1, ticket2));

        mockMvc.perform(get("/api/ticket/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[1].seat_number").value(6));
    }
}
