package com.starkindustries.order_processing_aop.service;

import com.starkindustries.order_processing_aop.annotations.Auditable;
import com.starkindustries.order_processing_aop.orders.Order;
import com.starkindustries.order_processing_aop.orders.OrderStatus;
import com.starkindustries.order_processing_aop.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
public class SingleOrderProcessor {

    private static final int DEFAULT_MIN_DELAY_MS = 500;
    private static final int DEFAULT_MAX_DELAY_MS = 3000;
    private static final double DEFAULT_FAILURE_PROBABILITY = 0.2; // 20%

    private final OrderRepository orderRepository;
    private final Random random = new Random();

    public SingleOrderProcessor(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Método principal de negocio para procesar un pedido.
     * La anotación @Auditable será interceptada por el aspecto.
     */
    @Auditable("Procesamiento de pedido")
    public void processOrder(Order order) {

        order.setStatus(OrderStatus.PROCESSING);
        order.setCurrentStep("Inicio de procesamiento");
        orderRepository.save(order);

        try {
            simulateStep("Verificando stock", order);
            simulateStep("Procesando pago", order);
            simulatePotentialFailure(order); // aquí puede lanzar la excepción
            simulateStep("Preparando envío", order);

            order.setStatus(OrderStatus.COMPLETED);
            order.setCurrentStep("Completado");
            order.setCompletedAt(Instant.now()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime());
            orderRepository.save(order);

        } catch (RuntimeException ex) {
            order.setStatus(OrderStatus.FAILED);
            order.setCurrentStep("Fallido");
            order.setFailureReason(ex.getMessage());
            order.setCompletedAt(Instant.now()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime());
            orderRepository.save(order);

            throw ex;
        }
    }

    private void simulateStep(String stepName, Order order) {
        order.setCurrentStep(stepName);
        orderRepository.save(order);

        int delay = getRandomDelayMs(order);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void simulatePotentialFailure(Order order) {
        double failureProbability = getFailureProbability(order);
        double value = random.nextDouble();
        if (value < failureProbability) {
            String message;
            if (value < failureProbability / 2) {
                message = "Pago rechazado (Error simulado)";
            } else {
                message = "Error al verificar stock (Error simulado)";
            }
            throw new RuntimeException(message);
        }
    }

    private int getRandomDelayMs(Order order) {
        int min = order.getMinProcessingDelayMs() != null
                ? order.getMinProcessingDelayMs()
                : DEFAULT_MIN_DELAY_MS;

        int max = order.getMaxProcessingDelayMs() != null
                ? order.getMaxProcessingDelayMs()
                : DEFAULT_MAX_DELAY_MS;

        if (min > max) {
            int tmp = min;
            min = max;
            max = tmp;
        }

        return min + random.nextInt(max - min + 1);
    }

    private double getFailureProbability(Order order) {
        Double prob = order.getFailureProbability();
        if (prob == null || prob < 0 || prob > 1) {
            return DEFAULT_FAILURE_PROBABILITY;
        }
        return prob;
    }
}
