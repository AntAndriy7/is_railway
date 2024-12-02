package org.example.is_lab.repository;

import org.example.is_lab.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.client_id = :client_id")
    List<Order> findByClient_id(Long client_id);
    @Query("SELECT o FROM Order o WHERE o.train_id = :train_id")
    List<Order> findByTrain_id(Long train_id);
    @Query("SELECT o FROM Order o WHERE o.train_id = :trainId AND o.payment_status IN :statuses")
    List<Order> findByTIdPS(Long trainId, List<String> statuses);
}
