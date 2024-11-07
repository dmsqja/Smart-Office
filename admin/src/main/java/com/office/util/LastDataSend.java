package com.office.util;

import org.json.simple.JSONObject;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class LastDataSend {
    public static void lastDataSend() {
        String logFile = "C:/spring_sm/logs/power.log";
        String url = "http://127.0.0.1:81/receiveChartData";
        String lastLine = null;

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new FileInputStream(logFile), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                lastLine = line;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (lastLine != null) {
            String[] parts = lastLine.split(",");
            if (parts.length == 2) {
                try {
                    // 날짜와 시간 파싱
                    LocalDateTime dateTime = LocalDateTime.parse(parts[0],
                            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                    // LocalDateTime을 밀리초 단위의 타임스탬프로 변환
                    long timestamp = dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();

                    // 값 파싱
                    double value = Double.parseDouble(parts[1].trim());

                    JSONObject data = new JSONObject();
                    data.put("timestamp", timestamp);  // ISO-8601 형식의 문자열로 변환
                    data.put("value", value);

                    HttpSendData.send(url, data.toJSONString());
                    System.out.println("Sent data: " + data.toJSONString());
                } catch (NumberFormatException e) {
                    System.out.println("Error parsing value: " + parts[1].trim());
                    e.printStackTrace();
                } catch (Exception e) {
                    System.out.println("Error parsing date or sending data: " + lastLine);
                    e.printStackTrace();
                }
            } else {
                System.out.println("Invalid line format: " + lastLine);
            }
        } else {
            System.out.println("File is empty or could not be read.");
        }
    }
}