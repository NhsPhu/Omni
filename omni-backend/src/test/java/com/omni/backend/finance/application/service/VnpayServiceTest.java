package com.omni.backend.finance.application.service;

import com.omni.backend.finance.domain.event.OrderPaidEvent;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class VnpayServiceTest {

    @Mock
    private ParentOrderRepository parentOrderRepository;

    @Mock
    private ChildOrderRepository childOrderRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private VnpayService vnpayService;

    private final String testSecret = "DEMO_SECRET_KEY_FOR_VNPAY_SANDBOX_TESTING_ONLY";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vnpayService, "vnpReturnUrl", "http://localhost:3000/payment/callback");
        ReflectionTestUtils.setField(vnpayService, "vnpTmnCode", "DEMO_TMN");
        ReflectionTestUtils.setField(vnpayService, "vnpHashSecret", testSecret);
        ReflectionTestUtils.setField(vnpayService, "restTemplate", restTemplate);
    }

    @Test
    void testCreatePaymentUrl_GeneratesCorrectUrl() {
        UUID orderId = UUID.randomUUID();
        BigDecimal amount = new BigDecimal("100000"); // 100k VND
        String ipAddress = "127.0.0.1";

        String paymentUrl = vnpayService.createPaymentUrl(orderId, amount, ipAddress);

        assertNotNull(paymentUrl);
        assertTrue(paymentUrl.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(paymentUrl.contains("vnp_Amount=10000000")); // 100k * 100
        assertTrue(paymentUrl.contains("vnp_Command=pay"));
        assertTrue(paymentUrl.contains("vnp_TxnRef=" + orderId.toString()));
        assertTrue(paymentUrl.contains("vnp_SecureHash="));
    }

    @Test
    void testProcessIpnCallback_Success() {
        UUID orderId = UUID.randomUUID();
        ParentOrderJpaEntity order = new ParentOrderJpaEntity();
        order.setId(orderId);
        order.setFinalAmount(new BigDecimal("100000"));
        order.setStatus("PENDING");

        Map<String, String> params = new HashMap<>();
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", orderId.toString());
        params.put("vnp_Amount", "10000000"); // 100k * 100
        params.put("vnp_BankCode", "NCB");

        // Compute valid signature
        String computedHash = ReflectionTestUtils.invokeMethod(vnpayService, "hmacSHA512", testSecret, 
                "vnp_Amount=10000000&vnp_BankCode=NCB&vnp_ResponseCode=00&vnp_TxnRef=" + orderId.toString());
        params.put("vnp_SecureHash", computedHash);

        when(parentOrderRepository.findById(orderId)).thenReturn(Optional.of(order));
        
        String result = vnpayService.processIpnCallback(params);
        
        assertEquals("00", result);
        assertEquals("PAID", order.getStatus());
        verify(walletService).creditAdminPending(orderId, 100000L);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(OrderPaidEvent.class));
    }

    @Test
    void testProcessRefund_Success() {
        UUID orderId = UUID.randomUUID();
        BigDecimal amount = new BigDecimal("50000"); // 50k VND
        String transDate = "20240101120000";

        // Mock restTemplate response containing success code "00"
        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn("{\"vnp_ResponseId\":\"12345\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"Success\"}");

        boolean result = vnpayService.processRefund(orderId, amount, transDate);

        assertTrue(result);
        verify(restTemplate, times(1)).postForObject(contains("merchant_webapi"), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testProcessRefund_Failure() {
        UUID orderId = UUID.randomUUID();
        BigDecimal amount = new BigDecimal("50000");
        String transDate = "20240101120000";

        // Mock restTemplate response containing error code "94"
        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn("{\"vnp_ResponseId\":\"12345\",\"vnp_ResponseCode\":\"94\",\"vnp_Message\":\"Duplicate request\"}");

        boolean result = vnpayService.processRefund(orderId, amount, transDate);

        assertFalse(result);
    }
}
