package com.starkindustries.order_processing_aop.orders;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número lógico del pedido dentro de la simulación
    @Column(nullable = false, unique = false)
    private Integer orderNumber;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    private String currentStep;

    /**
     * Parámetros opcionales de simulación:
     * Si son null, se usará un rango por defecto (por ejemplo 500–3000 ms).
     */
    private Integer minProcessingDelayMs;   // mínimo tiempo de procesamiento simulado
    private Integer maxProcessingDelayMs;   // máximo tiempo de procesamiento simulado

    /**
     * Probabilidad de fallo de este pedido (0.0–1.0).
     * Si es null, usaremos un valor por defecto, por ejemplo 0.2 (20%).
     */
    private Double failureProbability;

    public Order() {
    }

    public Order(Integer orderNumber,
                 String customerName,
                 BigDecimal totalAmount,
                 Integer minProcessingDelayMs,
                 Integer maxProcessingDelayMs,
                 Double failureProbability) {
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.minProcessingDelayMs = minProcessingDelayMs;
        this.maxProcessingDelayMs = maxProcessingDelayMs;
        this.failureProbability = failureProbability;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getters y setters =====

    public Long getId() {
        return id;
    }

    public Integer getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(Integer orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(String currentStep) {
        this.currentStep = currentStep;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getMinProcessingDelayMs() {
        return minProcessingDelayMs;
    }

    public void setMinProcessingDelayMs(Integer minProcessingDelayMs) {
        this.minProcessingDelayMs = minProcessingDelayMs;
    }

    public Integer getMaxProcessingDelayMs() {
        return maxProcessingDelayMs;
    }

    public void setMaxProcessingDelayMs(Integer maxProcessingDelayMs) {
        this.maxProcessingDelayMs = maxProcessingDelayMs;
    }

    public Double getFailureProbability() {
        return failureProbability;
    }

    public void setFailureProbability(Double failureProbability) {
        this.failureProbability = failureProbability;
    }
}