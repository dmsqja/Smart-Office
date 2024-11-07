
package com.office.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CarDto {
    private int carId;
    private String carName;
    private int carPrice;
    private String carColor;
    private String carType;
    private String carImg;
    private LocalDateTime productionDate;
}
