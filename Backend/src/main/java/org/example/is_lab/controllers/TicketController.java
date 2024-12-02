package org.example.is_lab.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.is_lab.dto.TicketDTO;
import org.example.is_lab.services.TicketService;

import java.util.List;

@RestController
@RequestMapping(value = "/api/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByOrderId(@PathVariable Long orderId) {
        List<TicketDTO> tickets = ticketService.getTicketsByOrderId(orderId);
        return tickets.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(tickets);
    }
}
