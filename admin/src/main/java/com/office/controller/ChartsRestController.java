package com.office.controller;

import com.office.util.LastDataSend;
import com.opencsv.CSVReader;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.FileReader;

@RestController
@Slf4j
public class ChartsRestController {
    private String lastData;

    @Value("${app.dir.readLogDir}")
    String readlogdir;


    @GetMapping("/getLastData")
    @ResponseBody
    public String getLastData() {
        LastDataSend.lastDataSend();
        return this.lastData;
    }

    @RequestMapping("/getChart")
    public Object chart6() throws Exception {
        String logfile = readlogdir+"power.log";

        JSONObject result = new JSONObject();

        //[{}]
        JSONArray jsonArray = new JSONArray();
        JSONObject jsonObject = new JSONObject();

        jsonObject.put("name", "Power");

        CSVReader reader = null;
        reader = new CSVReader(new FileReader(logfile));

        String [] lineData = null;
        JSONArray jsonArray1 = new JSONArray();
        JSONArray timeArray = new JSONArray();
        while((lineData = reader.readNext()) != null){
            jsonArray1.add(Float.parseFloat(lineData[1]));
            timeArray.add(lineData[0]);
        }

        jsonObject.put("data", jsonArray1);

        jsonArray.add(jsonObject);
        log.info(jsonArray.toJSONString());

        // [{}]
        // {'x':[], result:[{}]}
        result.put("result", jsonArray);
        result.put("x",timeArray );
        return result;
    }

    @RequestMapping("/receiveChartData")
    public void chart5(
            @RequestBody String lastData
    ) {
        this.lastData = lastData;
    }
}
