package com.office.interceptor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class WebSocketHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpSession session = servletRequest.getServletRequest().getSession(false);

            if (session != null) {
                // Spring Security 컨텍스트에서 인증 정보 가져오기
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth != null && auth.isAuthenticated()) {
                    String userId = auth.getName(); // 인증된 사용자의 ID를 가져옴

                    // 세션에서 사용자 정보 가져오기
                    String userInfo = servletRequest.getServletRequest().getHeader("userInfo");
                    if (userInfo != null) {
                        try {
                            ObjectMapper objectMapper = new ObjectMapper();
                            JsonNode userNode = objectMapper.readTree(userInfo);
                            String userName = userNode.get("name").asText();

                            attributes.put("X-User-Id", userId);
                            attributes.put("X-User-Name", userName);
                            log.debug("WebSocket handshake - User ID: {}, Name: {}", userId, userName);
                            return true;
                        } catch (Exception e) {
                            log.error("Error parsing user info from session", e);
                        }
                    }

                    // 기본 처리
                    attributes.put("X-User-Id", userId);
                    log.debug("WebSocket handshake - User ID added to attributes: {}", userId);
                    return true;
                } else {
                    log.warn("WebSocket handshake - No authenticated user found");
                    return false;
                }
            } else {
                log.warn("WebSocket handshake - No session found");
                return false;
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
        if (ex != null) {
            log.error("Error during WebSocket handshake", ex);
        }
        super.afterHandshake(request, response, wsHandler, ex);
    }
}