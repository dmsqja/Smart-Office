package com.office.config;

import com.office.app.security.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    @Value("${spring.profiles.active}")
    private String activeProfile;

    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationSuccessHandlerImpl authenticationSuccessHandler;
    private final AuthenticationFailureHandlerImpl authenticationFailureHandler;
    private final LogoutSuccessHandlerImpl logoutSuccessHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                                    "/",
                                    "/static/**",
                                    "/error",
                                    "/index.html",
                                    "/login",
                                    "/assets/**",
                                    "/manifest.json",
                                    "/favicon.ico"
                            ).permitAll()
                            .requestMatchers("/ws/**").authenticated()
                            .requestMatchers("/api/**").authenticated();

                    if ("dev".equals(activeProfile)) {
                        auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-resources/**").permitAll();
                    }

                    auth.anyRequest().authenticated();
                })
                .userDetailsService(userDetailsService)
                .sessionManagement(session -> {
                    session
                            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                            .invalidSessionUrl("/")
                            .maximumSessions(1)
                            .maxSessionsPreventsLogin(true)
                            .expiredUrl("/");
                    session.sessionFixation().newSession();
                })
                .formLogin(form -> {
                    form
                            .loginPage("/")
                            .loginProcessingUrl("/login")
                            .usernameParameter("employeeId")
                            .passwordParameter("password")
                            .successHandler(authenticationSuccessHandler)
                            .failureHandler(authenticationFailureHandler)
                            .permitAll();
                })
                .logout(logout -> {
                    logout
                            .logoutUrl("/logout")
                            .logoutSuccessUrl("/")
                            .deleteCookies("JSESSIONID")
                            .invalidateHttpSession(true)
                            .logoutSuccessHandler(logoutSuccessHandler);
                })
                .exceptionHandling(handling -> {
                    handling
                            .authenticationEntryPoint(authenticationEntryPoint)
                            .accessDeniedHandler(accessDeniedHandler);
                });

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}