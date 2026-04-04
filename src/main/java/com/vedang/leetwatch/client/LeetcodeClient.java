package com.vedang.leetwatch.client;

import okhttp3.*;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LeetcodeClient {

    private static final String URL = "https://leetcode.com/graphql";
    private final OkHttpClient client = new OkHttpClient();

    public String executeQuery(String query, String variablesJson) throws IOException {
        String bodyJson = "{ \"query\": " + escape(query) + ", \"variables\": " + variablesJson + " }";

        RequestBody body = RequestBody.create(
                bodyJson,
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(URL)
                .post(body)
                .addHeader("Content-Type", "application/json")
                .addHeader("Referer", "https://leetcode.com")
                .addHeader("User-Agent", "Mozilla/5.0")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response " + response);
            }

            return response.body().string();
        }
    }

    private String escape(String query) {
        return "\"" + query.replace("\"", "\\\"").replace("\n", "\\n") + "\"";
    }
}
