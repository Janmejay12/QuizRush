package com.example.QuizRush.filter;

import com.example.QuizRush.security.ParticipantAuthenticationToken;
import com.example.QuizRush.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class JwtFilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Autowired
    public JwtFilter(UserDetailsService userDetailsService, JwtService jwtService) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // Skip JWT validation for signup and login endpoints
        String requestPath = request.getRequestURI();


        if (requestPath.contains("/api/host/signup") || requestPath.contains("/api/host/login") ||
                requestPath.contains("/api/participant/join")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            username = jwtService.extractUsername(jwt);
            // Extract role claim to check if it's a participant
            String role = null;
            try {
                role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
            } catch (Exception e) {
                // Role might not be present
            }
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if("PARTICIPANT".equals(role)){
                    if (jwtService.validateToken(jwt, username)) {
                        ParticipantAuthenticationToken authentication =
                                new ParticipantAuthenticationToken(username, jwt);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
                else {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                    if (jwtService.validateToken(jwt, userDetails.getUsername())) {

                        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        usernamePasswordAuthenticationToken
                                .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    }
                }

            }
        }


        filterChain.doFilter(request, response);


    }
}
