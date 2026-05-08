package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AdminPayoutResponse;
import com.travelmarket.backend.dto.AdminPayoutSummaryResponse;
import com.travelmarket.backend.payment.service.AdminPayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payouts")
@RequiredArgsConstructor
public class AdminPayoutController {

    private final AdminPayoutService adminPayoutService;

    @GetMapping
    public List<AdminPayoutResponse> list() {
        return adminPayoutService.getAllPayouts();
    }

    @GetMapping("/summary")
    public AdminPayoutSummaryResponse getSummary() {
        return adminPayoutService.getPayoutSummary();
    }
}
