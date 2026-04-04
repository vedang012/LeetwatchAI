package com.vedang.leetwatch.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.vedang.leetwatch.dto.LeetcodeRawData;
import com.vedang.leetwatch.dto.UserAnalysisData;
import org.springframework.stereotype.Service;

@Service
public class AiService {

    private LeetcodeService leetcodeService;
    private LeetcodeAnalyzerService leetcodeAnalyzerService;

    public AiService(LeetcodeService leetcodeService, LeetcodeAnalyzerService leetcodeAnalyzerService) {
        this.leetcodeService = leetcodeService;
        this.leetcodeAnalyzerService = leetcodeAnalyzerService;
    }

    public String generatePrompt(String username) throws Exception {

        LeetcodeRawData rawData = leetcodeService.fetchAllData(username);

        UserAnalysisData analyzed = leetcodeAnalyzerService.processData(
                rawData.profileJson,
                rawData.calendarJson,
                rawData.tagJson
        );

        return buildPrompt(analyzed);
    }

    public String buildPrompt(UserAnalysisData data) {
        return """
        You are an experienced and strict coding mentor.

        Analyze the user's LeetCode performance and provide a practical improvement plan.

        Your goal is NOT to summarize, but to guide the user to improve.

        Rules:
        - Be direct and honest (no generic praise)
        - Identify specific weaknesses
        - Explain WHY those weaknesses matter
        - Give a clear, actionable plan
        - Avoid vague advice like "practice more"
        - Keep response under 180 words
        - Output MUST be in clean Markdown format

        Required Output Structure (STRICT):

        ## Score
        Give a score out of 100 based on:
        - difficulty progression
        - consistency
        - topic coverage
        - overall problem-solving maturity

        Format:
        **Score: X/100**

        ## Current Assessment
        Briefly describe the user's level and main issue.

        ## Key Problems
        - List 2–3 specific problems

        ## Why This Matters
        - Explain how these issues limit growth

        ## Action Plan
        - Give a concrete plan:
          - problems per day/week
          - difficulty mix
          - topics to focus on
          - behavior changes

        ## 7-Day Challenge
        - Give a short actionable challenge

        USER DATA:

        Total Solved: %d
        Easy: %d
        Medium: %d
        Hard: %d
        Ranking: %d

        Consistency: %s
        Active Days (Last 7 Days): %d

        Strong Topics: %s
        Weak Topics: %s

        Make the response feel like a strict mentor giving real direction.
        """.formatted(
                data.totalSolved,
                data.easy,
                data.medium,
                data.hard,
                data.ranking,
                data.consistency,
                data.activeDaysLastWeek,
                String.join(", ", data.strongTags),
                String.join(", ", data.weakTags)
        );
    }
    public String generateLLMResponse(String username) throws Exception {
        Client client = new Client();

        GenerateContentResponse response =
                client.models.generateContent("gemini-2.5-flash", generatePrompt(username), null);


        return response.text();
    }


}
