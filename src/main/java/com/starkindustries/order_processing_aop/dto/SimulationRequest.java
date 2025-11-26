package com.starkindustries.order_processing_aop.dto;

public class SimulationRequest {

    private Integer numberOfOrders;
    private Integer minProcessingDelayMs;
    private Integer maxProcessingDelayMs;
    private Double failureProbability;

    public Integer getNumberOfOrders() {
        return numberOfOrders;
    }

    public void setNumberOfOrders(Integer numberOfOrders) {
        this.numberOfOrders = numberOfOrders;
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
