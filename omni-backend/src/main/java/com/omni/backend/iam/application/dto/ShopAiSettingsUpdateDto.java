package com.omni.backend.iam.application.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class ShopAiSettingsUpdateDto {
    private Boolean aiChatbotEnabled;
    
    @Size(max = 50)
    private String aiProvider;
    
    @Size(max = 50)
    private String aiTone;
    
    private String aiCustomInstructions;
}
