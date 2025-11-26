package com.starkindustries.order_processing_aop.aspects;

import com.starkindustries.order_processing_aop.annotations.Auditable;
import com.starkindustries.order_processing_aop.orders.Order;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class OrderAuditingAspect {

    /**
     * @Around: mide tiempo, imprime inicio y fin del proceso.
     */
    @Around("@annotation(auditable)")
    public Object aroundAuditable(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {
        Order order = extractOrderArgument(pjp.getArgs());

        if (order != null) {
            System.out.printf("--- Auditoría: Inicio de proceso para Pedido %d ---%n",
                    order.getOrderNumber());
        } else {
            System.out.println("--- Auditoría: Inicio de proceso (pedido no encontrado en args) ---");
        }

        long start = System.currentTimeMillis();

        try {
            Object result = pjp.proceed();

            long elapsed = System.currentTimeMillis() - start;

            if (order != null) {
                System.out.printf("[PERFORMANCE] Pedido %d procesado en %d ms%n",
                        order.getOrderNumber(), elapsed);
                System.out.printf("--- Auditoría: Fin de proceso para Pedido %d ---%n",
                        order.getOrderNumber());
            } else {
                System.out.printf("[PERFORMANCE] Método %s procesado en %d ms%n",
                        pjp.getSignature().getName(), elapsed);
                System.out.println("--- Auditoría: Fin de proceso (pedido no encontrado) ---");
            }

            return result;

        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;

            if (order != null) {
                System.out.printf("[PERFORMANCE] Pedido %d falló tras %d ms%n",
                        order.getOrderNumber(), elapsed);
            } else {
                System.out.printf("[PERFORMANCE] Método %s falló tras %d ms%n",
                        pjp.getSignature().getName(), elapsed);
            }

            throw ex;
        }
    }

    /**
     * @AfterThrowing: captura y registra errores simulados.
     */
    @AfterThrowing(pointcut = "@annotation(auditable)", throwing = "ex")
    public void afterThrowingAuditable(JoinPoint jp, Auditable auditable, Throwable ex) {
        Order order = extractOrderArgument(jp.getArgs());

        if (order != null) {
            System.out.printf("[ERROR] Pedido %d falló: %s%n",
                    order.getOrderNumber(), ex.getMessage());
        } else {
            System.out.printf("[ERROR] Error en método %s: %s%n",
                    jp.getSignature().toShortString(), ex.getMessage());
        }
    }

    /**
     * Intenta encontrar un objeto Order en la lista de argumentos del método interceptado.
     */
    private Order extractOrderArgument(Object[] args) {
        if (args == null) return null;
        for (Object arg : args) {
            if (arg instanceof Order) {
                return (Order) arg;
            }
        }
        return null;
    }
}
