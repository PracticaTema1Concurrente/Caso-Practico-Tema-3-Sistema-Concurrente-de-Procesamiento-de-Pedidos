package com.starkindustries.order_processing_aop.dto;

import java.util.List;

public class ProcessOrdersRequest {

    private List<Long> orderIds;

    public List<Long> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<Long> orderIds) {
        this.orderIds = orderIds;
    }
}
