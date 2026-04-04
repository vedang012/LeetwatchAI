package com.vedang.leetwatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Model;
import com.vedang.leetwatch.dto.LeetcodeRawData;
import com.vedang.leetwatch.dto.UserAnalysisData;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final LeetcodeService leetcodeService;
    private final LeetcodeAnalyzerService leetcodeAnalyzerService;

    public AiService(LeetcodeService leetcodeService,
                     LeetcodeAnalyzerService leetcodeAnalyzerService) {
        this.leetcodeService = leetcodeService;
        this.leetcodeAnalyzerService = leetcodeAnalyzerService;
    }

    // ---------------- TOPIC COVERAGE ----------------
    public Map<String, Integer> buildTopicCoverage(String tagJson) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(tagJson);

        JsonNode tagCounts = root.path("data")
                .path("matchedUser")
                .path("tagProblemCounts");

        Map<String, Integer> topicCount = new HashMap<>();

        List<String> CORE_TOPICS = List.of(
                "Arrays", "Two Pointers", "Sliding Window", "Binary Search",
                "Stack", "Queue", "Heap", "Hashing", "Linked List",
                "Tree", "Binary Search Tree", "Graph",
                "Dynamic Programming", "Backtracking", "Greedy"
        );

        CORE_TOPICS.forEach(topic -> topicCount.put(topic, 0));

        Map<String, String> TAG_MAPPING = Map.ofEntries(
                Map.entry("Array", "Arrays"),
                Map.entry("Two Pointers", "Two Pointers"),
                Map.entry("Sliding Window", "Sliding Window"),
                Map.entry("Binary Search", "Binary Search"),
                Map.entry("Stack", "Stack"),
                Map.entry("Monotonic Stack", "Stack"),
                Map.entry("Queue", "Queue"),
                Map.entry("Heap (Priority Queue)", "Heap"),
                Map.entry("Hash Table", "Hashing"),
                Map.entry("Linked List", "Linked List"),
                Map.entry("Tree", "Tree"),
                Map.entry("Binary Search Tree", "Binary Search Tree"),
                Map.entry("Graph", "Graph"),
                Map.entry("Depth-First Search", "Graph"),
                Map.entry("Breadth-First Search", "Graph"),
                Map.entry("Dynamic Programming", "Dynamic Programming"),
                Map.entry("Backtracking", "Backtracking"),
                Map.entry("Greedy", "Greedy")
        );

        for (String level : List.of("fundamental", "intermediate", "advanced")) {
            for (JsonNode tag : tagCounts.path(level)) {

                String rawTag = tag.path("tagName").asText();
                int count = tag.path("problemsSolved").asInt();

                String mappedTopic = TAG_MAPPING.get(rawTag);

                if (mappedTopic != null) {
                    topicCount.put(
                            mappedTopic,
                            topicCount.getOrDefault(mappedTopic, 0) + count
                    );
                }
            }
        }

        return topicCount;
    }

    // ---------------- MAIN FLOW ----------------
    public String generatePrompt(String username) throws Exception {

        LeetcodeRawData rawData = leetcodeService.fetchAllData(username);

        UserAnalysisData analyzed = leetcodeAnalyzerService.processData(
                rawData.profileJson,
                rawData.calendarJson,
                rawData.tagJson
        );

        Map<String, Integer> topicCount =
                buildTopicCoverage(rawData.tagJson);

        int threshold = Math.max(2, (int) Math.ceil(analyzed.totalSolved * 0.05));

        // Weak topics
        List<String> weakTopics = topicCount.entrySet().stream()
                .filter(e -> e.getValue() < threshold)
                .sorted(Map.Entry.comparingByValue())
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        // Strong topics
        List<String> strongTopics = topicCount.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        analyzed.weakTags = weakTopics;
        analyzed.strongTags = strongTopics;

        int score = calculateScore(analyzed);

        return buildPrompt(analyzed, score, topicCount);
    }

    // ---------------- SCORE ----------------
    private int calculateScore(UserAnalysisData data) {

        int score = 0;

        int total = Math.max(data.totalSolved, 1);

        double hardRatio = (double) data.hard / total;
        double mediumRatio = (double) data.medium / total;

        score += Math.min((int) (hardRatio * 30 + mediumRatio * 15), 30);

        int consistencyScore = switch (data.consistency) {
            case "consistent" -> 30;
            case "moderate" -> 20;
            default -> 10;
        };

        score += consistencyScore;

        score += Math.min(data.strongTags.size() * 5, 20);

        score += Math.min(data.activeDaysLastWeek * 3, 20);

        return Math.min(score, 100);
    }

    // ---------------- PROMPT ----------------
    public String buildPrompt(UserAnalysisData data, int score, Map<String, Integer> topicCoverage) {

        String topicBreakdown = topicCoverage.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining("\n"));

        return """
        You are a strict and practical coding mentor.

        The user's score is already calculated. Do NOT change it but show it.
        Your job is to explain and guide improvement concisely.

        OUTPUT RULES:
        - Max ~250 words
        - Use bullet points
        - No long explanations
        - No repetition
        - Be direct, not motivational

        -----------------------------

        ## Score
        **Score: %d/100**

        ## Overall Assessment
        (1 line, max 20 words)

        ## Main Bottleneck
        Identify the single biggest issue.

        ## Topic Gaps
        - List weakest IMPORTANT topics only
        - Mention what's lacking briefly

        ## Strengths
        - 2–3 concise points

        ## Action Plan
        - Problems per day
        - Difficulty mix
        - Weekly topic focus (1 topic/week)

        -----------------------------

        USER DATA:
        Total: %d | Easy: %d | Medium: %d | Hard: %d
        Consistency: %s | Active Days: %d

        Topic Coverage:
        %s

        Tone:
        - strict but not insulting
        - critical but constructive
        """.formatted(
                score,
                data.totalSolved,
                data.easy,
                data.medium,
                data.hard,
                data.consistency,
                data.activeDaysLastWeek,
                topicBreakdown
        );
    }
    // ---------------- LLM ----------------
    public String generateLLMResponse(String username) throws Exception {

        Client client = Client.builder().build();

        for (Model model : client.models.list(null)) {
            System.out.println(model.name());
        }

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3-flash-preview",
                        generatePrompt(username),
                        null
                );

        return response.text();
    }
}