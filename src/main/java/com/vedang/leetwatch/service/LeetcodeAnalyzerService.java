package com.vedang.leetwatch.service;

import com.vedang.leetwatch.dto.UserAnalysisData;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;


@Service
public class LeetcodeAnalyzerService {


    public UserAnalysisData processData(
            String profileJson,
            String calendarJson,
            String tagJson
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        UserAnalysisData data = new UserAnalysisData();

        // ---------------- PROFILE ----------------
        JsonNode profileRoot = mapper.readTree(profileJson);
        JsonNode user = profileRoot.path("data").path("matchedUser");

        data.ranking = user.path("profile").path("ranking").asInt();

        JsonNode stats = user.path("submitStatsGlobal").path("acSubmissionNum");

        for (JsonNode item : stats) {
            String difficulty = item.path("difficulty").asText();
            int count = item.path("count").asInt();

            switch (difficulty) {
                case "All" -> data.totalSolved = count;
                case "Easy" -> data.easy = count;
                case "Medium" -> data.medium = count;
                case "Hard" -> data.hard = count;
            }
        }

        // ---------------- CALENDAR ----------------
        JsonNode calendarRoot = mapper.readTree(calendarJson);
        String calendarStr = calendarRoot.path("data")
                .path("matchedUser")
                .path("submissionCalendar")
                .asText();

        Map<String, Integer> calendarMap =
                mapper.readValue(calendarStr, Map.class);

        int activeDays = 0;
        int todayEpoch = (int) (System.currentTimeMillis() / 1000);
        int sevenDaysAgo = todayEpoch - (7 * 24 * 60 * 60);

        for (Map.Entry<String, Integer> entry : calendarMap.entrySet()) {
            int timestamp = Integer.parseInt(entry.getKey());

            if (timestamp >= sevenDaysAgo && entry.getValue() > 0) {
                activeDays++;
            }
        }

        data.activeDaysLastWeek = activeDays;

        if (activeDays >= 5) data.consistency = "consistent";
        else if (activeDays >= 3) data.consistency = "moderate";
        else data.consistency = "irregular";

        // ---------------- TAGS ----------------
        JsonNode tagRoot = mapper.readTree(tagJson);
        JsonNode tagCounts = tagRoot.path("data")
                .path("matchedUser")
                .path("tagProblemCounts");

        Map<String, Integer> tagMap = new HashMap<>();

        // merge all levels
        for (String level : List.of("fundamental", "intermediate", "advanced")) {
            for (JsonNode tag : tagCounts.path(level)) {
                String name = tag.path("tagName").asText();
                int count = tag.path("problemsSolved").asInt();
                tagMap.put(name, count);
            }
        }

        // sort tags
        List<Map.Entry<String, Integer>> sortedTags =
                new ArrayList<>(tagMap.entrySet());

        sortedTags.sort((a, b) -> b.getValue() - a.getValue());

        // strong = top 3
        data.strongTags = sortedTags.stream()
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        // weak = bottom 3 (excluding zeros)
        data.weakTags = sortedTags.stream()
                .filter(e -> e.getValue() > 0)
                .sorted(Comparator.comparingInt(Map.Entry::getValue))
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        return data;
    }
}
