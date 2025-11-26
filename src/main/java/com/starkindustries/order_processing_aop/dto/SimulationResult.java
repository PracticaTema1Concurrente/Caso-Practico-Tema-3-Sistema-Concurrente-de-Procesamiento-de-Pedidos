package com.starkindustries.order_processing_aop.dto;

public class SimulationResult {

    private int totalOrders;
    private long completed;
    private long failed;
    private long totalTimeMs;

    public SimulationResult(int totalOrders, long completed, long failed, long totalTimeMs) {
        this.totalOrders = totalOrders;
        this.completed = completed;
        this.failed = failed;
        this.totalTimeMs = totalTimeMs;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public long getCompleted() {
        return completed;
    }

    public long getFailed() {
        return failed;
    }

    public long getTotalTimeMs() {
        return totalTimeMs;
    }
}
