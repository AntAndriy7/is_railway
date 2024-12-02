package org.example.is_lab.services;

import lombok.RequiredArgsConstructor;
import org.example.is_lab.dto.AuthDTO;
import org.example.is_lab.entity.Order;
import org.example.is_lab.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.example.is_lab.entity.User;
import org.example.is_lab.dto.UserDTO;
import org.example.is_lab.mapper.UserMapper;
import org.example.is_lab.repository.UserRepository;

import java.sql.Date;
import java.util.Calendar;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final UserMapper mapper = UserMapper.INSTANCE;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUser(Long id) {
        return userRepository.findById(id)
                .map(mapper::toDTO)
                .orElse(null);
    }

    public User getByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null) {
            user.setRecent_activity(new Date(System.currentTimeMillis()));
            userRepository.save(user);
        }
        return user;
    }

    public List<User> getUsersByTrainId(Long trainId) {
        List<Order> orders = orderRepository.findByTrain_id(trainId);

        List<Long> userIds = orders.stream()
                .map(Order::getClient_id).distinct()
                .collect(Collectors.toList());

        System.out.println("trainId" + trainId);
        System.out.println("userIds" + userIds);
        return userRepository.findAllById(userIds);
    }

    public List<UserDTO> getInactiveUsers() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, -5);
        Date fiveYearsAgoDate = new Date(calendar.getTimeInMillis());

        List<User> inactiveUsers = userRepository.findByActivity(fiveYearsAgoDate);
        return inactiveUsers.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }


    public UserDTO createUser(UserDTO userDTO) {
        String encodedPassword = passwordEncoder.encode(userDTO.getPassword());
        userDTO.setPassword(encodedPassword);
        userDTO.setRecent_activity(new Date(System.currentTimeMillis()));

        User user = mapper.toEntity(userDTO);

        user = userRepository.save(user);
        return mapper.toDTO(user);
    }

    public boolean authenticate(AuthDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail());
        if (user != null) {
            return passwordEncoder.matches(loginDTO.getPassword(), user.getPassword());
        }
        return false;
    }

    //Иожливо оновити всі параметри ОКРІМ role
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        return userRepository.findById(id).map(existingUser -> {
            if (userDTO.getName() != null) {
                existingUser.setName(userDTO.getName());
            }
            if (userDTO.getEmail() != null) {
                existingUser.setEmail(userDTO.getEmail());
            }
            if (userDTO.getPhone_number() != null) {
                existingUser.setPhone_number(userDTO.getPhone_number());
            }
            if (userDTO.getPassword() != null) {
                existingUser.setPassword(userDTO.getPassword());
            }
            if (userDTO.getRecent_activity() != null) {
                existingUser.setRecent_activity(userDTO.getRecent_activity());
            }

            userRepository.save(existingUser);
            return mapper.toDTO(existingUser);
        }).orElse(null);
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}