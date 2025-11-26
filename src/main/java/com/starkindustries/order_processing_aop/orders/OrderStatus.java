package com.starkindustries.order_processing_aop.orders;

public enum OrderStatus {
    PENDING,        // Pedido creado, pendiente de procesar
    PROCESSING,     // En curso
    COMPLETED,      // Procesado correctamente
    FAILED          // Falló durante el procesamiento
}
