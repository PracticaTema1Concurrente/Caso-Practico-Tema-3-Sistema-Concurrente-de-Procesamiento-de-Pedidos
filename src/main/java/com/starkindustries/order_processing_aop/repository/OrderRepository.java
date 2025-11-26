package com.starkindustries.order_processing_aop.repository;

import com.starkindustries.order_processing_aop.orders.Order;
import com.starkindustries.order_processing_aop.orders.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatus(OrderStatus status);
}