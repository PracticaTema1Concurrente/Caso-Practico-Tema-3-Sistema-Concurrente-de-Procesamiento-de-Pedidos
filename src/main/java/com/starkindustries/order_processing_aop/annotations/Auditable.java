package com.starkindustries.order_processing_aop.annotations;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {

    /**
     * Descripción opcional del proceso.
     * Ej: "Procesamiento de pedido".
     */
    String value() default "";
}
