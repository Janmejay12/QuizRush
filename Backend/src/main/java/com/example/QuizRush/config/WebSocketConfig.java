package com.example.QuizRush.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(8192);
        container.setMaxBinaryMessageBufferSize(8192);
        container.setMaxSessionIdleTimeout(null); // No timeout
        container.setAsyncSendTimeout(null); // No timeout
        return container;
    }@Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Topic prefix for quiz broadcasts with heartbeat settings
        registry.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[] {20000, 20000})  // Server sends and expects heartbeat every 20 seconds
                .setTaskScheduler(heartbeatScheduler());  // Use custom scheduler

        // Prefix for client-to-server messages
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Bean
    public TaskScheduler heartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        return scheduler;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/quiz-ws")
                .setAllowedOriginPatterns("*");  // Raw WebSocket endpoint
        
        registry.addEndpoint("/quiz-ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();  // SockJS fallback
    }    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setSendTimeLimit(60 * 1000)  // 60 seconds
                .setSendBufferSizeLimit(1024 * 1024)  // 1MB
                .setMessageSizeLimit(256 * 1024)  // 256KB
                .setTimeToFirstMessage(60 * 1000);  // 60 seconds for initial connection
    }

    @Bean
    public WebMvcConfigurer websocketCorsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/quiz-ws/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST")
                        .allowedHeaders("*");
            }
        };
    }
}
