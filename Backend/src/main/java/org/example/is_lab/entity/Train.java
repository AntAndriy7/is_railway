package org.example.is_lab.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;
import java.sql.Time;

@Data
@Entity
@Table(name = "trains")
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "railway_id")
    private long railway_id;

    @Column(name = "train_number")
    private String train_number;

    @Column(name = "departure")
    private String departure;

    @Column(name = "destination")
    private String destination;

    @Column(name = "departure_time")
    private Time departure_time;

    @Column(name = "arrival_time")
    private Time arrival_time;

    @Column(name = "departure_date")
    private Date departure_date;

    @Column(name = "arrival_date")
    private Date arrival_date;

    @Column(name = "status")
    private boolean status;

    @Column(name = "ticket_price")
    private long ticket_price;

    @Column(name = "seats")
    private long seats;

    @Column(name = "occupied_seats")
    private long occupied_seats;
}