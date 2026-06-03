package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TrackingResponseDto {
    private String trackingCode;
    private String currentStatus;
    private List<TrackingEventDto> timeline;

    @Data
    @Builder
    public static class TrackingEventDto {
        private String status;
        private String statusName;
        private String location;
        private String occurredAt;
    }
}
