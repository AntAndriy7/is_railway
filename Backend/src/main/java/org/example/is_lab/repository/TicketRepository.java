package org.example.is_lab.repository;

import org.example.is_lab.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT t FROM Ticket t WHERE t.order_id = :order_id")
    List<Ticket> findByOrder_id(Long order_id);
}
