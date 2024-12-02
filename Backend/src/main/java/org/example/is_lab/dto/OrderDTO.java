package org.example.is_lab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private long id;
    private long client_id;
    private long train_id;
    private long ticket_quantity;
    private long total_price;
    private String payment_status;
}