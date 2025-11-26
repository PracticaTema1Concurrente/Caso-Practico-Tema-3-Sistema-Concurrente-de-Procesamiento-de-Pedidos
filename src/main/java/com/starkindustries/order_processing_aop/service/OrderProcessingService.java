package com.starkindustries.order_processing_aop.service;

import com.starkindustries.order_processing_aop.dto.SimulationResult;
import com.starkindustries.order_processing_aop.orders.Order;
import com.starkindustries.order_processing_aop.orders.OrderStatus;
import com.starkindustries.order_processing_aop.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;
import jakarta.annotation.PreDestroy;

@Service
public class OrderProcessingService {

    private final OrderRepository orderRepository;
    private final SingleOrderProcessor singleOrderProcessor;
    private final Random random = new Random();

    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(10);

    public OrderProcessingService(OrderRepository orderRepository,
                                  SingleOrderProcessor singleOrderProcessor) {
        this.orderRepository = orderRepository;
        this.singleOrderProcessor = singleOrderProcessor;
    }

    @PreDestroy
    public void shutdownExecutor() {
        asyncExecutor.shutdown();
    }

    /**
     * Método de conveniencia con valores por defecto.
     */
    public SimulationResult simulateOrders(int numberOfOrders) throws InterruptedException {
        return simulateOrders(numberOfOrders, null, null, null);
    }

    public void processOrderAsync(Order order) {
        asyncExecutor.submit(() -> singleOrderProcessor.processOrder(order));
    }

    public void processOrderByIdAsync(Long id) {
        Order order = getOrderById(id);
        processOrderAsync(order);
    }

    public void processAllPendingAsync() {
        List<Order> pending = orderRepository.findByStatus(OrderStatus.PENDING);
        for (Order order : pending) {
            processOrderAsync(order);
        }
    }

    /**
     * Simula varios pedidos con parámetros opcionales de tiempos y probabilidad de fallo.
     */
    public SimulationResult simulateOrders(int numberOfOrders,
                                           Integer minDelayMs,
                                           Integer maxDelayMs,
                                           Double failureProbability) throws InterruptedException {

        System.out.println("=== INICIO DE SIMULACIÓN DE PEDIDOS ===");

        List<Order> orders = createRandomOrders(numberOfOrders, minDelayMs, maxDelayMs, failureProbability);
        orderRepository.saveAll(orders);

        int poolSize = Math.min(numberOfOrders, 10);
        ExecutorService executor = Executors.newFixedThreadPool(poolSize);

        Instant start = Instant.now();
        List<Future<?>> futures = new ArrayList<>();

        for (Order order : orders) {
            System.out.printf("[INFO] Pedido %d recibido para el cliente: %s%n",
                    order.getOrderNumber(), order.getCustomerName());

            Future<?> future = executor.submit(() -> singleOrderProcessor.processOrder(order));
            futures.add(future);
        }

        for (Future<?> future : futures) {
            try {
                future.get();
            } catch (ExecutionException e) {
                // El fallo ya se ha gestionado en SingleOrderProcessor + aspecto
            }
        }

        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.MINUTES);

        Instant end = Instant.now();
        long totalMs = Duration.between(start, end).toMillis();

        long completed = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        long failed = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.FAILED)
                .count();

        System.out.println();
        System.out.println("=== PROCESAMIENTO FINALIZADO ===");
        System.out.printf("Pedidos completados exitosamente: %d%n", completed);
        System.out.printf("Pedidos con error: %d%n", failed);
        System.out.printf("Tiempo total de simulación: %d ms aprox.%n", totalMs);

        return new SimulationResult(numberOfOrders, completed, failed, totalMs);
    }

    // ===== Métodos de apoyo para la web =====

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
    }

    public Order createOrder(String customerName,
                             BigDecimal totalAmount,
                             Integer minDelayMs,
                             Integer maxDelayMs,
                             Double failureProbability) {

        int orderNumber = (int) (orderRepository.count() + 1);

        Order order = new Order(
                orderNumber,
                customerName,
                totalAmount,
                minDelayMs,
                maxDelayMs,
                failureProbability
        );

        return orderRepository.save(order);
    }

    public void deleteAllOrders() {
        orderRepository.deleteAll();
    }

    // === Generación de pedidos de prueba ===

    private List<Order> createRandomOrders(int numberOfOrders,
                                           Integer minDelayMs,
                                           Integer maxDelayMs,
                                           Double failureProbability) {
        List<Order> orders = new ArrayList<>();

        String[] sampleNames = {
                "Ana López", "Carlos Gómez", "Marta Ruiz", "Diego Torres", "Laura Fernández",
                "Pedro Ramírez", "Sofía Medina", "Juan Pérez", "Lucía Vargas", "Jorge Castillo"
        };

        for (int i = 1; i <= numberOfOrders; i++) {
            String customerName = sampleNames[(i - 1) % sampleNames.length];

            // Total entre 10 y 200 euros aprox.
            BigDecimal total = BigDecimal.valueOf(10 + random.nextInt(191));

            Order order = new Order(
                    i,
                    customerName,
                    total,
                    minDelayMs,
                    maxDelayMs,
                    failureProbability
            );

            orders.add(order);
        }

        return orders;
    }
}
