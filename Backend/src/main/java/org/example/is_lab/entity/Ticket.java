package org.example.is_lab.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "order_id")
    private long order_id;

    @Column(name = "name")
    private String name;

    @Column(name = "seat_number")
    private long seat_number;
}