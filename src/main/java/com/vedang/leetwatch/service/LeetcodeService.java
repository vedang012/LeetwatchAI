package com.vedang.leetwatch.service;

import com.vedang.leetwatch.client.LeetcodeClient;
import com.vedang.leetwatch.dto.LeetcodeRawData;
import com.vedang.leetwatch.dto.UserAnalysisData;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class LeetcodeService {

    private LeetcodeClient client;

    public LeetcodeService(LeetcodeClient client) {
        this.client = client;
    }

    public String getUserProfile(String username) throws IOException {
        String query = """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile { ranking reputation userAvatar realName }
            submitStatsGlobal {
              acSubmissionNum { difficulty count }
            }
          }
        }
    """;

        String variables = "{ \"username\": \"" + username + "\" }";

        return client.executeQuery(query, variables);
    }

    public String getSubmissionCalendar(String username) throws IOException {
        String query = """
        query getCalendar($username: String!) {
          matchedUser(username: $username) {
            submissionCalendar
          }
        }
    """;

        String variables = "{ \"username\": \"" + username + "\" }";

        return client.executeQuery(query, variables);
    }

    public String getRecentSubmissions(String username) throws IOException {
        String query = """
        query getRecent($username: String!) {
          recentSubmissionList(username: $username) {
            title
            titleSlug
            statusDisplay
            lang
            timestamp
          }
        }
    """;

        String variables = "{ \"username\": \"" + username + "\" }";

        return client.executeQuery(query, variables);
    }

    public String getTagStats(String username) throws IOException {
        String query = """
        query getTags($username: String!) {
          matchedUser(username: $username) {
            tagProblemCounts {
              advanced { tagName problemsSolved }
              intermediate { tagName problemsSolved }
              fundamental { tagName problemsSolved }
            }
          }
        }
    """;

        String variables = "{ \"username\": \"" + username + "\" }";

        return client.executeQuery(query, variables);
    }

    public LeetcodeRawData fetchAllData(String username) throws IOException {
        return new LeetcodeRawData(
                getUserProfile(username),
                getSubmissionCalendar(username),
                getTagStats(username),
                getRecentSubmissions(username)
        );
    }



}
