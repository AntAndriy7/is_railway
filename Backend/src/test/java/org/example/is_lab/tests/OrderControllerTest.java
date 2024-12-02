package org.example.is_lab.tests;

import org.example.is_lab.controllers.OrderController;
import org.example.is_lab.dto.OrderDTO;
import org.example.is_lab.services.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;


@WebMvcTest(OrderController.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    public void testGetOrdersByClientId() throws Exception {
        OrderDTO order1 = new OrderDTO(1L, 1L, 1L, 2, 500, "paid");
        OrderDTO order2 = new OrderDTO(2L, 1L, 2L, 1, 300, "booked");

        when(orderService.getOrdersByClientId(1L)).thenReturn(Arrays.asList(order1, order2));

        mockMvc.perform(get("/api/order/client/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].payment_status").value("paid"))
                .andExpect(jsonPath("$[1].payment_status").value("booked"));
    }

    @Test
    public void testCreateOrder() throws Exception {
        OrderDTO newOrder = new OrderDTO(1L, 1L, 1L, 2, 500, "paid");

        when(orderService.addOrder(any(OrderDTO.class), anyList())).thenReturn(newOrder);

        mockMvc.perform(post("/api/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"client_id\":1,\"train_id\":1,\"ticket_quantity\":2,\"total_price\":500}")
                        .param("tickets", "John Doe", "Jane Doe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payment_status").value("paid"));
    }
}

