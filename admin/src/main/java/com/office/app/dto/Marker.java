package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marker {
    private double lat;
    private double lng;
    private String title;
    private String img;
    private int code;
}


