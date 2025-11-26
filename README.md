Iván Hidalgo y Gabriel Kaakedjian

# Caso-Practico-Tema-3-Sistema-Concurrente-de-Procesamiento-de-Pedidos

### Resumen:

Una empresa de comercio electrónico quiere simular un sistema que procese simultáneamente múltiples pedidos de clientes. Cada pedido se procesa en un hilo independiente (por ejemplo, verificación de stock, cobro, envío). Se busca aplicar Programación Orientada a Aspectos (AOP) para separar las tareas de auditoría, control de rendimiento y manejo de excepciones, sin ensuciar la lógica del negocio principal.

### Objetivos:

Diseñar e implementar una aplicación Spring Boot que gestione de forma concurrente múltiples pedidos de una tienda online, aplicando aspectos AOP para registrar, auditar y controlar el rendimiento de los procesos de pedido.

### Requerimientos:

### Estructura general del proyecto

Crear un proyecto Spring Boot con los siguientes paquetes:

  orders → clases que representan los pedidos y su procesamiento.
  service → servicios que gestionan las operaciones concurrentes.
  aspects → aspectos AOP que interceptan y registran la ejecución.
  annotations → anotaciones personalizadas (por ejemplo, @Auditable o @TimedProcess).

### Concurrencia

Simular la llegada de varios pedidos al sistema (por ejemplo, 10 pedidos simultáneos).
Cada pedido se procesa en un hilo independiente mediante:

  ExecutorService, o
  métodos asincrónicos con @Async y @EnableAsync.
  
Cada hilo debe realizar tareas simuladas con pausas aleatorias (uso de Thread.sleep()) para representar tiempos de red o cálculo.

### Programación Orientada a Aspectos (AOP)

Definir un aspecto con @Aspect que:

  Intercepte los métodos marcados con @Auditable para registrar inicio y fin de cada pedido.
  Use @Around para calcular el tiempo de ejecución de cada proceso.
  Use @AfterThrowing para capturar y registrar errores simulados (por ejemplo, “pago rechazado”).

### Anotaciones personalizadas

Crear una anotación @Auditable o @TimedProcess para marcar los métodos que deben ser auditados o cronometrados.
El aspecto debe reconocer estas anotaciones para aplicar el comportamiento transversal.

### Simulación

Desde el main, crear varios pedidos (por ejemplo, Order(id, total, customerName)), y enviarlos a procesar concurrentemente.
Simular que algunos pedidos fallan (por ejemplo, lanzar excepciones aleatorias para ciertos hilos).

### Ejemplo de salida esperada:

=== INICIO DE SIMULACIÓN DE PEDIDOS ===

[INFO] Pedido 1 recibido para el cliente: Ana López
[INFO] Pedido 2 recibido para el cliente: Carlos Gómez
[INFO] Pedido 3 recibido para el cliente: Marta Ruiz
[INFO] Pedido 4 recibido para el cliente: Diego Torres
[INFO] Pedido 5 recibido para el cliente: Laura Fernández
[INFO] Pedido 6 recibido para el cliente: Pedro Ramírez
[INFO] Pedido 7 recibido para el cliente: Sofía Medina
[INFO] Pedido 8 recibido para el cliente: Juan Pérez
[INFO] Pedido 9 recibido para el cliente: Lucía Vargas
[INFO] Pedido 10 recibido para el cliente: Jorge Castillo

--- Auditoría: Inicio de proceso para Pedido 1 ---
--- Auditoría: Inicio de proceso para Pedido 2 ---
--- Auditoría: Inicio de proceso para Pedido 3 ---
...

[PERFORMANCE] Pedido 1 procesado en 2048 ms
[PERFORMANCE] Pedido 2 procesado en 1720 ms
[PERFORMANCE] Pedido 3 procesado en 3081 ms
[PERFORMANCE] Pedido 4 procesado en 1523 ms
[ERROR] Pedido 5 falló: Pago rechazado (Error simulado)
[PERFORMANCE] Pedido 6 procesado en 2987 ms
[PERFORMANCE] Pedido 7 procesado en 1999 ms
[ERROR] Pedido 8 falló: Error al verificar stock (Error simulado)
[PERFORMANCE] Pedido 9 procesado en 1655 ms
[PERFORMANCE] Pedido 10 procesado en 2100 ms

--- Auditoría: Fin de proceso para Pedido 1 ---
--- Auditoría: Fin de proceso para Pedido 2 ---
--- Auditoría: Fin de proceso para Pedido 3 ---
--- Auditoría: Fin de proceso para Pedido 4 ---
--- Auditoría: Fin de proceso para Pedido 6 ---
--- Auditoría: Fin de proceso para Pedido 7 ---
--- Auditoría: Fin de proceso para Pedido 9 ---
--- Auditoría: Fin de proceso para Pedido 10 ---

=== PROCESAMIENTO FINALIZADO ===
Pedidos completados exitosamente: 8
Pedidos con error: 2
Tiempo total de simulación: 3200 ms aprox.
