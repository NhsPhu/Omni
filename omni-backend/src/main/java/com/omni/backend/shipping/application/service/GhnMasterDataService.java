package com.omni.backend.shipping.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GhnMasterDataService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ghn.api.url:https://dev-online-gateway.ghn.vn/shiip/public-api/v2}")
    private String ghnApiUrl;

    @Value("${ghn.api.token:0000}")
    private String ghnApiToken;

    private String getMasterDataUrl(String path) {
        // Master data path doesn't have /v2/shipping-order, it is under /master-data
        // e.g. https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province
        return ghnApiUrl.replace("/v2", "") + "/master-data/" + path;
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnApiToken);
        return headers;
    }

    @Cacheable("ghnProvinces")
    public List<Map<String, Object>> getProvinces() {
        try {
            HttpEntity<Void> request = new HttpEntity<>(getHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    getMasterDataUrl("province"),
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                if (rootNode.has("data") && rootNode.get("data").isArray()) {
                    List<Map<String, Object>> result = new ArrayList<>();
                    for (JsonNode node : rootNode.get("data")) {
                        result.add(Map.of(
                                "ProvinceID", node.get("ProvinceID").asInt(),
                                "ProvinceName", node.get("ProvinceName").asText()
                        ));
                    }
                    return result;
                }
            }
            throw new RuntimeException("GHN API failed to get provinces");
        } catch (Exception e) {
            log.error("Error fetching GHN provinces, returning mock data", e);
            return List.of(
                Map.of("ProvinceID", 201, "ProvinceName", "Hà Nội"),
                Map.of("ProvinceID", 202, "ProvinceName", "Hồ Chí Minh")
            );
        }
    }

    @Cacheable("ghnDistricts")
    public List<Map<String, Object>> getDistricts(int provinceId) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(getMasterDataUrl("district"))
                    .queryParam("province_id", provinceId)
                    .toUriString();
                    
            HttpEntity<Void> request = new HttpEntity<>(getHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                if (rootNode.has("data") && rootNode.get("data").isArray()) {
                    List<Map<String, Object>> result = new ArrayList<>();
                    for (JsonNode node : rootNode.get("data")) {
                        result.add(Map.of(
                                "DistrictID", node.get("DistrictID").asInt(),
                                "DistrictName", node.get("DistrictName").asText(),
                                "ProvinceID", node.get("ProvinceID").asInt()
                        ));
                    }
                    return result;
                }
            }
            throw new RuntimeException("GHN API failed to get districts");
        } catch (Exception e) {
            log.error("Error fetching GHN districts for province {}, returning mock data", provinceId, e);
            return List.of(
                Map.of("DistrictID", 1442, "DistrictName", "Quận 1", "ProvinceID", provinceId),
                Map.of("DistrictID", 1443, "DistrictName", "Quận 2", "ProvinceID", provinceId)
            );
        }
    }

    @Cacheable("ghnWards")
    public List<Map<String, Object>> getWards(int districtId) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(getMasterDataUrl("ward"))
                    .queryParam("district_id", districtId)
                    .toUriString();

            HttpEntity<Void> request = new HttpEntity<>(getHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                if (rootNode.has("data") && rootNode.get("data").isArray()) {
                    List<Map<String, Object>> result = new ArrayList<>();
                    for (JsonNode node : rootNode.get("data")) {
                        result.add(Map.of(
                                "WardCode", node.get("WardCode").asText(),
                                "WardName", node.get("WardName").asText(),
                                "DistrictID", node.get("DistrictID").asInt()
                        ));
                    }
                    return result;
                }
            }
            throw new RuntimeException("GHN API failed to get wards");
        } catch (Exception e) {
            log.error("Error fetching GHN wards for district {}, returning mock data", districtId, e);
            return List.of(
                Map.of("WardCode", "20101", "WardName", "Phường Bến Nghé", "DistrictID", districtId),
                Map.of("WardCode", "20102", "WardName", "Phường Bến Thành", "DistrictID", districtId)
            );
        }
    }
}
