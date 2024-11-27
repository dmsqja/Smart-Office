package com.office.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.office.app.service.MeetingRoomService;
import com.office.handler.WebRTCSignalingHandler;
import com.office.interceptor.WebSocketHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final ObjectMapper objectMapper;
    private final MeetingRoomService meetingRoomService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(
                        new WebRTCSignalingHandler(objectMapper, meetingRoomService),
                        "/ws/signaling"
                )
                .setAllowedOrigins("*")
                .addHandler(webRTCSignalingHandler(), "/ws/signaling")
                .addInterceptors(new WebSocketHandshakeInterceptor());
    }

    @Bean
    public WebRTCSignalingHandler webRTCSignalingHandler() {
        return new WebRTCSignalingHandler(objectMapper, meetingRoomService);
    }
}
