package org.example.is_lab.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.is_lab.dto.TicketDTO;
import org.example.is_lab.mapper.TicketMapper;
import org.example.is_lab.repository.TicketRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketMapper mapper = TicketMapper.INSTANCE;

    public List<TicketDTO> getTicketsByOrderId(Long orderId) {
        return ticketRepository.findByOrder_id(orderId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
