package com.chainmind.ai.provider;

public interface AiProvider {
    String generateResponse(String systemPrompt, String userMessage);
    boolean isConfigured();
}
