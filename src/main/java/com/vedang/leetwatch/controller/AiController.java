package com.vedang.leetwatch.controller;

import com.vedang.leetwatch.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leetcode")
public class AiController {

    private AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/ai")
    public ResponseEntity<?> generateLLMResponse(@RequestParam String username) throws Exception {
        return ResponseEntity.ok().body(aiService.generateLLMResponse(username));
    }
}
