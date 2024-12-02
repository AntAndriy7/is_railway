package org.example.is_lab.repository;

import org.example.is_lab.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    @Query("SELECT t FROM Train t WHERE t.status = :status")
    List<Train> findByStatus(Boolean status);
    @Query("SELECT t FROM Train t WHERE t.railway_id = :railway_id")
    List<Train> findByRailwayId(Long railway_id);
}

