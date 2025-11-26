package com.starkindustries.order_processing_aop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.starkindustries.order_processing_aop.service.OrderProcessingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OrderProcessingAopApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderProcessingAopApplication.class, args);
	}
/*
    @Bean
    public CommandLineRunner demo(OrderProcessingService orderProcessingService) {
        return args -> {
            orderProcessingService.simulateOrders(10);
        };
    }
*/
}
