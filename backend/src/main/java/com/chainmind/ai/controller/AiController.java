package com.chainmind.ai.controller;

import com.chainmind.ai.entity.AiInsight;
import com.chainmind.ai.entity.AiMessage;
import com.chainmind.ai.service.AiService;
import com.chainmind.common.response.ApiResponse;
import com.chainmind.config.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Intelligence", description = "AI Operational Insights, Supplier Analysis & Conversational Assistant APIs")
public class AiController {

    private final AiService aiService;

    @GetMapping("/insights")
    @Operation(summary = "Get AI Operational Insights")
    public ResponseEntity<ApiResponse<List<AiInsight>>> getInsights(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AiInsight> insights = aiService.getInsights(userPrincipal.getOrganizationId());
        return ResponseEntity.ok(ApiResponse.success(insights));
    }

    @Data
    public static class ChatRequest {
        private Long conversationId;
        private String prompt;
    }

    @PostMapping("/assistant/chat")
    @Operation(summary = "Chat with AI Supply Chain Assistant")
    public ResponseEntity<ApiResponse<AiMessage>> chatWithAssistant(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody ChatRequest request) {
        AiMessage responseMsg = aiService.chatWithAssistant(
                userPrincipal.getOrganizationId(),
                userPrincipal.getId(),
                request.getConversationId(),
                request.getPrompt()
        );
        return ResponseEntity.ok(ApiResponse.success(responseMsg));
    }

    @GetMapping("/suppliers/{supplierId}/analyze")
    @Operation(summary = "Analyze supplier with AI")
    public ResponseEntity<ApiResponse<String>> analyzeSupplier(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long supplierId) {
        String analysis = aiService.analyzeSupplier(userPrincipal.getOrganizationId(), supplierId);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }
}
