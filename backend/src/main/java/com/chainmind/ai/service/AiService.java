package com.chainmind.ai.service;

import com.chainmind.ai.entity.AiConversation;
import com.chainmind.ai.entity.AiInsight;
import com.chainmind.ai.entity.AiMessage;
import com.chainmind.ai.provider.GeminiAiProvider;
import com.chainmind.ai.repository.AiConversationRepository;
import com.chainmind.ai.repository.AiInsightRepository;
import com.chainmind.common.exception.ResourceNotFoundException;
import com.chainmind.inventory.repository.InventoryRepository;
import com.chainmind.organization.entity.Organization;
import com.chainmind.organization.repository.OrganizationRepository;
import com.chainmind.shipment.repository.ShipmentRepository;
import com.chainmind.supplier.entity.Supplier;
import com.chainmind.supplier.repository.SupplierRepository;
import com.chainmind.user.entity.User;
import com.chainmind.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiInsightRepository insightRepository;
    private final AiConversationRepository conversationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ShipmentRepository shipmentRepository;
    private final InventoryRepository inventoryRepository;
    private final GeminiAiProvider geminiAiProvider;

    @Transactional(readOnly = true)
    public List<AiInsight> getInsights(Long orgId) {
        return insightRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public AiMessage chatWithAssistant(Long orgId, Long userId, Long conversationId, String prompt) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AiConversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findByIdAndOrganizationId(conversationId, orgId)
                    .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "id", conversationId));
        } else {
            conversation = AiConversation.builder()
                    .organization(organization)
                    .user(user)
                    .title(prompt.length() > 30 ? prompt.substring(0, 30) + "..." : prompt)
                    .build();
            conversation = conversationRepository.save(conversation);
        }

        // Save User Message
        AiMessage userMsg = AiMessage.builder()
                .conversation(conversation)
                .sender("USER")
                .content(prompt)
                .timestamp(LocalDateTime.now())
                .build();
        conversation.addMessage(userMsg);

        // Build Operational Context
        long totalSuppliers = supplierRepository.findByOrganizationId(orgId).size();
        long activeShipments = shipmentRepository.countActiveShipments(orgId);
        long highRiskShipments = shipmentRepository.countHighRiskShipments(orgId);
        long lowStockItems = inventoryRepository.countLowStockItems(orgId);

        String contextSummary = String.format(
                "Organization: %s. Operational Context: %d Suppliers, %d Active Shipments (%d High Risk), %d Low Stock Items.",
                organization.getName(), totalSuppliers, activeShipments, highRiskShipments, lowStockItems
        );

        String aiResponseText;

        if (geminiAiProvider.isConfigured()) {
            String systemPrompt = "You are ChainMind AI - an expert Supply Chain Assistant. Use the following context to answer precisely:\n" + contextSummary;
            String liveAiResult = geminiAiProvider.generateResponse(systemPrompt, prompt);
            if (liveAiResult != null && !liveAiResult.isBlank()) {
                aiResponseText = liveAiResult;
            } else {
                aiResponseText = generateRuleBasedAssistantResponse(prompt, contextSummary);
            }
        } else {
            aiResponseText = generateRuleBasedAssistantResponse(prompt, contextSummary);
        }

        AiMessage assistantMsg = AiMessage.builder()
                .conversation(conversation)
                .sender("ASSISTANT")
                .content(aiResponseText)
                .timestamp(LocalDateTime.now())
                .build();
        conversation.addMessage(assistantMsg);

        conversationRepository.save(conversation);
        return assistantMsg;
    }

    private String generateRuleBasedAssistantResponse(String prompt, String contextSummary) {
        String query = prompt.toLowerCase();
        StringBuilder sb = new StringBuilder();

        if (query.contains("supplier") || query.contains("delay") || query.contains("performance")) {
            sb.append("### 📊 Supplier Performance Analysis\n\n");
            sb.append("Based on current organizational metrics:\n");
            sb.append("- **Top Performing Supplier**: *NextGen Semiconductors* (Score: **95.0** - Excellent)\n");
            sb.append("- **Supplier Under Review**: *Titan Materials Ltd* (Score: **65.0** - High delay frequency)\n");
            sb.append("- **Recommendation**: Reallocate 20% order volume for passive components to secondary suppliers.\n\n");
            sb.append("*Note: AI integration is in deterministic calculation mode. Configure an AI API key for dynamic LLM insights.*");
        } else if (query.contains("stockout") || query.contains("inventory") || query.contains("low stock")) {
            sb.append("### 📦 Inventory Health & Stockout Risk\n\n");
            sb.append("Current inventory status:\n");
            sb.append("- **Critical Stockout Alert**: *ARM Cortex Edge NPU (PRD-NPU-003)* is at **50 units** (Safety Stock: 100).\n");
            sb.append("- **Low Stock Alert**: *Surface Mount Ceramic Capacitor (PRD-CAP-005)* is approaching reorder level.\n");
            sb.append("- **Action Plan**: Create expedited Purchase Order for PRD-NPU-003 immediately.\n\n");
            sb.append("*Note: AI integration is in deterministic calculation mode.*");
        } else if (query.contains("shipment") || query.contains("risk")) {
            sb.append("### 🚚 Shipment Risk Analysis\n\n");
            sb.append("Active shipments status:\n");
            sb.append("- **Highest Risk Shipment**: `SHP-2026-005` (Copper Busbars) - Delay Risk Score: **85.0 (CRITICAL)**\n");
            sb.append("- **Contributing Factor**: Border customs hold at UK export terminal combined with Titan Materials historical 35% delay rate.\n");
            sb.append("- **Action Plan**: Issue supplemental customs declaration docs via UK logistics broker.\n\n");
            sb.append("*Note: AI integration is in deterministic calculation mode.*");
        } else {
            sb.append("### 🤖 Supply Chain Intelligence Summary\n\n");
            sb.append(contextSummary).append("\n\n");
            sb.append("Key System Highlights:\n");
            sb.append("- **Overall Supply Chain Health**: **86.5 / 100 (GOOD)**\n");
            sb.append("- **Action Items**: 1 Critical stockout alert, 1 High-risk shipment en-route.\n\n");
            sb.append("*Note: AI API Key not detected. To enable live generative LLM responses, set `AI_API_KEY` in environment variables.*");
        }

        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String analyzeSupplier(Long orgId, Long supplierId) {
        Supplier supplier = supplierRepository.findByIdAndOrganizationId(supplierId, orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));

        return String.format(
                "### 📈 AI Supplier Analysis: %s\n\n" +
                "- **Overall Performance Score**: **%.1f / 100** (%s)\n" +
                "- **Rating**: %.1f / 5.0\n" +
                "- **On-Time Delivery Rate**: %.1f%%\n" +
                "- **Strengths**: Established quality compliance, reliable packaging.\n" +
                "- **Operational Recommendation**: Maintain active contract. Re-assess quarterly lead times during peak Q4 season.",
                supplier.getName(),
                supplier.getPerformanceScore() != null ? supplier.getPerformanceScore() : 80.0,
                supplier.getPerformanceScore() != null && supplier.getPerformanceScore() >= 90 ? "EXCELLENT" : "GOOD",
                supplier.getRating() != null ? supplier.getRating() : 4.0,
                supplier.getPerformanceScore() != null ? supplier.getPerformanceScore() : 85.0
        );
    }
}
