package org.example.is_lab.jwt;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter(urlPatterns = {"/api/*"})
public class JwtFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        if ((("POST".equalsIgnoreCase(request.getMethod()) || "GET".equalsIgnoreCase(request.getMethod())))) {
            chain.doFilter(req, res);
            return;
        }

        /*if ((("POST".equalsIgnoreCase(request.getMethod()) || "GET".equalsIgnoreCase(request.getMethod())) && (request.getRequestURI().endsWith("/api/user") || request.getRequestURI().endsWith("/api/user/login")))
                || (("GET".equalsIgnoreCase(request.getMethod())) && (request.getRequestURI().endsWith("/api/train") || request.getRequestURI().matches("/api/user/\\d+") || request.getRequestURI().endsWith("/api/train/status")))) {
            chain.doFilter(req, res);
            return;
        }*/

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            JwtUtil jwtUtil = new JwtUtil();
            try {
                if (jwtUtil.validateToken(token, jwtUtil.extractEmail(token))) {
                    chain.doFilter(req, res);
                } else {
                    ((HttpServletResponse) res).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                }
            } catch (Exception e) {
                ((HttpServletResponse) res).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
            }
        } else {
            ((HttpServletResponse) res).sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token is missing");
        }
    }
}
