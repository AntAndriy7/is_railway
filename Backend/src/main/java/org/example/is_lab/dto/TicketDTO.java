package org.example.is_lab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDTO {
    private long id;
    private long order_id;
    private String name;
    private long seat_number;
}

