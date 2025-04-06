package com.example.QuizRush.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class ParticipantAuthenticationToken extends AbstractAuthenticationToken {
    private final String principal;
    private final String token;

    public ParticipantAuthenticationToken(String nickname, String token) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_PARTICIPANT")));
        this.principal = nickname;
        this.token = token;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}
