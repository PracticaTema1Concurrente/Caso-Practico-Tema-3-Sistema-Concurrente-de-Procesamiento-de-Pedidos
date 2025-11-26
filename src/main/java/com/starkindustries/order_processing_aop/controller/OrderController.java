package com.starkindustries.order_processing_aop.controller;

import com.starkindustries.order_processing_aop.dto.CreateOrderRequest;
import com.starkindustries.order_processing_aop.dto.SimulationRequest;
import com.starkindustries.order_processing_aop.dto.SimulationResult;
import com.starkindustries.order_processing_aop.orders.Order;
import com.starkindustries.order_processing_aop.orders.OrderStatus;
import com.starkindustries.order_processing_aop.service.OrderProcessingService;
import com.starkindustries.order_processing_aop.dto.ProcessOrdersRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderProcessingService orderProcessingService;

    public OrderController(OrderProcessingService orderProcessingService) {
        this.orderProcessingService = orderProcessingService;
    }

    /**
     * Lanzar una simulación de pedidos.
     * POST /api/orders/simulate
     * Body JSON:
     * {
     *   "numberOfOrders": 10,
     *   "minProcessingDelayMs": 500,
     *   "maxProcessingDelayMs": 3000,
     *   "failureProbability": 0.2
     * }
     * Todos los campos son opcionales; si faltan se usan valores por defecto.
     */
    @PostMapping("/simulate")
    public SimulationResult simulateOrders(@RequestBody(required = false) SimulationRequest request)
            throws InterruptedException {

        int numberOfOrders = 10;
        Integer minDelay = null;
        Integer maxDelay = null;
        Double failureProb = null;

        if (request != null) {
            if (request.getNumberOfOrders() != null) {
                numberOfOrders = request.getNumberOfOrders();
            }
            minDelay = request.getMinProcessingDelayMs();
            maxDelay = request.getMaxProcessingDelayMs();
            failureProb = request.getFailureProbability();
        }

        return orderProcessingService.simulateOrders(numberOfOrders, minDelay, maxDelay, failureProb);
    }

    /**
     * Crear un pedido manual (sin lanzarlo a simulación automáticamente).
     * POST /api/orders
     * Body JSON:
     * {
     *   "customerName": "Nombre",
     *   "totalAmount": 100.50,
     *   "minProcessingDelayMs": 500,
     *   "maxProcessingDelayMs": 3000,
     *   "failureProbability": 0.1
     * }
     */
    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderProcessingService.createOrder(
                request.getCustomerName(),
                request.getTotalAmount(),
                request.getMinProcessingDelayMs(),
                request.getMaxProcessingDelayMs(),
                request.getFailureProbability()
        );

        boolean autoProcess = request.getAutoProcess() == null || Boolean.TRUE.equals(request.getAutoProcess());
        if (autoProcess) {
            orderProcessingService.processOrderAsync(order);
        }

        return order;
    }

    /**
     * Procesar TODOS los pedidos que estén en estado PENDING.
     * POST /api/orders/process-pending
     */
    @PostMapping("/process-pending")
    public void processPendingOrders() {
        orderProcessingService.processAllPendingAsync();
    }

    /**
     * Listar pedidos.
     * GET /api/orders
     * GET /api/orders?status=COMPLETED
     */
    @GetMapping
    public List<Order> getOrders(@RequestParam(name = "status", required = false) OrderStatus status) {
        if (status != null) {
            return orderProcessingService.getOrdersByStatus(status);
        }
        return orderProcessingService.getAllOrders();
    }

    /**
     * Procesar solo los pedidos cuyos IDs se indiquen.
     * POST /api/orders/process
     * Body:
     * { "orderIds": [1, 2, 5] }
     */
    @PostMapping("/process")
    public void processSpecificOrders(@RequestBody ProcessOrdersRequest request) {
        if (request.getOrderIds() != null) {
            for (Long id : request.getOrderIds()) {
                orderProcessingService.processOrderByIdAsync(id);
            }
        }
    }

    /**
     * Ver detalle de un pedido.
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderProcessingService.getOrderById(id);
    }

    /**
     * Borrar todos los pedidos (útil para reiniciar simulaciones).
     * DELETE /api/orders
     */
    @DeleteMapping
    public void deleteAllOrders() {
        orderProcessingService.deleteAllOrders();
    }
}