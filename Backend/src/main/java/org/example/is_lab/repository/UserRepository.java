package org.example.is_lab.repository;

import org.example.is_lab.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    User findByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.recent_activity < :date")
    List<User> findByActivity(Date date);
}
