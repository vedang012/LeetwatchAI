package com.vedang.leetwatch.controller;

import com.vedang.leetwatch.service.LeetcodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/leetcode")
public class LeetcodeController {

    private LeetcodeService service;

    public LeetcodeController(LeetcodeService service) {
        this.service = service;
    }

    @GetMapping("/users/{username}/profile")
    public ResponseEntity<String> getUserProfile(@PathVariable("username") String username) throws IOException {
        return ResponseEntity.ok(service.getUserProfile(username));
    }

    @GetMapping("/users/{username}/submission-calendar")
    public ResponseEntity<String> getSubmissionCalendar(@PathVariable("username") String username) throws IOException {
        return ResponseEntity.ok(service.getSubmissionCalendar(username));
    }

    @GetMapping("/users/{username}/recent-submissions")
    public ResponseEntity<String> getRecentSubmissions(@PathVariable("username") String username) throws IOException {
        return ResponseEntity.ok(service.getRecentSubmissions(username));
    }

    @GetMapping("/users/{username}/tag-stats")
    public ResponseEntity<String> getTagStats(@PathVariable("username") String username) throws IOException {
        return ResponseEntity.ok(service.getTagStats(username));
    }

//    @GetMapping("/users/{username}/validate")
//    public ResponseEntity<Boolean> validateLeetcodeUsername(@PathVariable("username") String username) {
//        return ResponseEntity.ok(service.validateUsername(username));
//    }


}
