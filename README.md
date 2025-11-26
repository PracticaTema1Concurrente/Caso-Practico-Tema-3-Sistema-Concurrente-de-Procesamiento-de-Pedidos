📦 Caso-Práctico-Tema-3: Sistema Concurrente de Procesamiento de Pedidos
PedidoSimulator

PedidoSimulator es una aplicación para simular el procesamiento de pedidos con diferentes estados y pasos, registrar su ejecución mediante auditoría y almacenar los resultados en una base de datos H2.

La aplicación permite ejecutar simulaciones de manera individual, masiva o en bucle, y visualiza los datos en tiempo real y tras la finalización de la simulación.

🚀 Características

Simulación de pedidos con estados:

PENDING

PROCESSING

COMPLETED

FAILED

Probabilidad configurable de fallo por pedido.

Auditoría de pedidos mediante Aspecto Spring Boot (@Auditable) que intercepta y controla los métodos durante el proceso.

Persistencia de resultados en H2 + Hibernate.

Visualización en tiempo real de los pedidos:

Radar de estados con bolitas animadas.

Estadísticas dinámicas de desempeño.

Tablas resumen tras la simulación con métricas y volumen económico.

Simulaciones:

Individual

Masiva

Bucle automático

🏗️ Arquitectura
Backend (Spring Boot)

Controladores: Endpoints REST para iniciar simulaciones y consultar resultados.

Servicios: Lógica de simulación y manejo de pedidos.

Repositorios: Persistencia de entidades Order en H2.

Aspectos (@Auditable): Interceptan métodos para auditar cambios de estado.

Frontend (JavaScript / HTML / CSS)

Radar de pedidos en tiempo real, mostrando bolitas según estado.

Tablas y estadísticas dinámicas.

Recepción de datos vía API REST (o WebSocket según implementación).

Controles de simulación:

Iniciar un pedido

Simular múltiples pedidos

Ejecutar bucle automático

Base de datos (H2)

Almacenamiento de todas las órdenes simuladas.

Consultas de estados y métricas agregadas.

Integración completa con Hibernate para persistencia automática.

🔄 Flujo de datos

Generación de pedidos: Se crea un pedido con ID único y estado inicial PENDING.

Procesamiento: Los pedidos avanzan a PROCESSING → (COMPLETED o FAILED) según la probabilidad de fallo.

Auditoría: Cada cambio de estado se intercepta mediante @Auditable.

Persistencia: Los pedidos finalizados se guardan en H2.

Visualización: El frontend recibe los datos en tiempo real y genera bolitas en el radar + estadísticas.

Post-simulación: Tablas resumen muestran métricas finales y volumen económico.

⚡ Cómo ejecutar
# Clonar el repositorio
git clone <repositorio>

# Ejecutar la aplicación Spring Boot
./mvnw spring-boot:run


Acceder a la interfaz web: http://localhost:8080

Controles de simulación:

Simular 1 pedido

Simular varios pedidos

Iniciar bucle automático

🔧 Personalización

Probabilidad de fallo: Configurable en el servicio de simulación.

Duración de visualización de bolitas: Configurable en spawnPulseDots (por defecto 10 segundos).

Base de datos: H2 puede reemplazarse por cualquier otra compatible con Spring Data JPA.

📦 Dependencias
Backend

Spring Boot 3.x

Spring Web

Spring Data JPA

H2 Database

Frontend

Vanilla JS / HTML / CSS

Auditoría

AspectJ / Spring AOP
