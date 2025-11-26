# Caso-Practico-Tema-3-Sistema-Concurrente-de-Procesamiento-de-Pedidos

PedidoSimulator

PedidoSimulator es una aplicación para simular el procesamiento de pedidos con diferentes estados y pasos, registrar su ejecución mediante auditoría y almacenar los resultados en una base de datos H2. La aplicación permite ejecutar simulaciones de manera individual, masiva o en bucle, y visualiza los datos en tiempo real y tras la finalización de la simulación.

Características

Simulación de pedidos con estados: PENDING, PROCESSING, COMPLETED, FAILED.

Probabilidad configurable de fallo en cada pedido.

Auditoría de cada pedido mediante un Aspecto Spring Boot (@Auditable) que intercepta y controla los métodos durante el proceso.

Persistencia de resultados en H2 + Hibernate.

Visualización en tiempo real de los pedidos en una interfaz web con radar de estados y estadísticas.

Tablas resumen después de la simulación con métricas de desempeño y volumen económico.

Ejecución de simulaciones individuales, masivas o en bucle automático.

Arquitectura
Backend (Spring Boot)

Controladores: Exponen endpoints REST para iniciar simulaciones y consultar resultados.

Servicios: Contienen la lógica de simulación y manejo de pedidos.

Repositorios: Manejan la persistencia de entidades Order en H2.

Aspectos (@Auditable): Interceptan métodos relevantes para auditar el estado de los pedidos durante su ejecución.

Frontend (JavaScript / HTML / CSS)

Radar de pedidos en tiempo real, mostrando bolitas según estado (PENDING, PROCESSING, COMPLETED, FAILED).

Tablas y estadísticas dinámicas de la simulación.

Recepción de datos vía API REST o WebSocket (según implementación).

Control de simulaciones: iniciar 1 pedido, múltiples pedidos, o bucle automático.

Base de datos (H2)

Almacenamiento de todas las órdenes simuladas.

Consultas de estados y métricas agregadas.

Integración completa con Hibernate para persistencia automática de entidades.

Flujo de datos

Generación de pedidos: La simulación crea un pedido con un ID único y estado inicial PENDING.

Procesamiento: El pedido pasa por los estados PROCESSING → (COMPLETED o FAILED) según la probabilidad de fallo.

Auditoría: Cada cambio de estado es interceptado por @Auditable para registrar logs y métricas.

Persistencia: El pedido finalizado se guarda en la base de datos H2.

Visualización: El frontend recibe los datos en tiempo real y genera bolitas en el radar y estadísticas agregadas.

Post-simulación: Las tablas resumen muestran métricas finales y volumen económico.

Cómo ejecutar

Clonar el repositorio:

git clone <repositorio>


Ejecutar la aplicación Spring Boot:

./mvnw spring-boot:run


Acceder a la interfaz web en http://localhost:8080.

Usar los botones de simulación:

Simular 1 pedido

Simular varios pedidos

Iniciar bucle automático

Personalización

Probabilidad de fallo: Configurable en el servicio de simulación.

Duración de visualización de bolitas: Configurable en spawnPulseDots en frontend (por defecto 10 segundos).

Base de datos: H2 puede ser reemplazada por otra base compatible con Spring Data JPA.

Dependencias

Backend:

Spring Boot 3.x

Spring Web

Spring Data JPA

H2 Database

Frontend:

Vanilla JS / HTML / CSS

Auditoría:

AspectJ / Spring AOP
