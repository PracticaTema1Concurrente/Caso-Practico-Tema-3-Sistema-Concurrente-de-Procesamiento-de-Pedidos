package com.starkindustries.order_processing_aop.dto;

import java.math.BigDecimal;

public class CreateOrderRequest {

    private String customerName;
    private BigDecimal totalAmount;

    // Parámetros opcionales de simulación
    private Integer minProcessingDelayMs;
    private Integer maxProcessingDelayMs;
    private Double failureProbability;

    private Boolean autoProcess;

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

    public Boolean getAutoProcess() {
        return autoProcess;
    }

    public void setAutoProcess(Boolean autoProcess) {
        this.autoProcess = autoProcess;
    }

    public Double getFailureProbability() {
        return failureProbability;
    }

    public void setFailureProbability(Double failureProbability) {
        this.failureProbability = failureProbability;
    }
}
