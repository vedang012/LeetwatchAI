package com.vedang.leetwatch.dto;

public class LeetcodeRawData {
    public String profileJson;
    public String calendarJson;
    public String tagJson;
    public String recentJson;

    public LeetcodeRawData(String profileJson, String calendarJson,
                           String tagJson, String recentJson) {
        this.profileJson = profileJson;
        this.calendarJson = calendarJson;
        this.tagJson = tagJson;
        this.recentJson = recentJson;
    }
}