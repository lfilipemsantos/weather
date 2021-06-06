function get_data() {
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/1182100.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    const current = new Date();
             // By default US English uses 12hr time with AM/PM
    const time = current.toLocaleTimeString("pt-PT");

    console.log(time.split(':', 1))
    console.log(time);

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            var no_data = new Array ( 0 , 24 , 49 );
            data = request.response
            console.log(data);
            //document.getElementById("temperature").textContent = data[0]["tMax"] + "ºC";
            //document.getElementById("min_temperature").textContent = "Tmin: " + data[0]["tMin"] + "ºC";
            //document.getElementById("max_temperature").textContent = "Tmax: " + data[0]["tMax"] + "ºC";
            
            
            
            document.getElementById("table_temp").textContent = data[0]["tMax"] + "ºC";
            document.getElementById("tmax").textContent = "TMax: " + data[0]["tMax"] + "ºC";
            document.getElementById("tmin").textContent = "TMin: " + data[0]["tMin"] + "ºC";
            document.getElementById("uv").textContent = "UV: " + data[0]["iUv"];
            document.getElementById("prec").textContent = "Precip.: " + data[0]["probabilidadePrecipita"] + "%";

            for (i=1; i<23; i++) {
                var hour_split = data[i]["dataPrev"].split("T",2)[1].split(":")
                var hour = hour_split[0] + ":" + hour_split[1]
                console.log(hour.split(":", 1))
                if (parseInt(hour.split(":"))<parseInt(time)) {
                    continue;
                }
                
                var row = document.createElement('div');
                var temp = document.createElement('p');
                var hour_text = document.createElement('p');
                temp.setAttribute('id', i);
                temp.setAttribute('class', "hour_temp");
                row.setAttribute('class', 'row');
                temp.textContent = data[i]["tMed"] + "ºC";
                hour_text.textContent = hour;
                hour_text.setAttribute('class', "hour_time");
                row.appendChild(temp);
                row.appendChild(hour_text);
                document.getElementById("innerToday").appendChild(row);
                if (i+1 == time.split(':', 1)){
                    document.getElementById("table_temp").textContent = data[i]["tMed"] + "ºC";
                }
            }

            var hour_split = data[23]["dataPrev"].split("T",2)[1].split(":")
                var hour = hour_split[0] + ":" + hour_split[1]
                
                var row = document.createElement('div');
                var temp = document.createElement('p');
                var hour_text = document.createElement('p');
                temp.setAttribute('id', "1"+23);
                temp.setAttribute('class', "hour_temp");
                row.setAttribute('class', 'row');
                temp.textContent = data[23]["tMed"] + "ºC";
                hour_text.textContent = hour;
                hour_text.setAttribute('class', "hour_time");
                row.appendChild(temp);
                row.appendChild(hour_text);
                document.getElementById("innerTomorrow").appendChild(row);
                if (i+1 == time.split(':', 1)){
                    document.getElementById("table_temp").textContent = data[23]["tMed"] + "ºC";
                }

            for (i=25; i<48; i++) {
                var hour_split = data[i]["dataPrev"].split("T",2)[1].split(":")
                var hour = hour_split[0] + ":" + hour_split[1]
                
                var row = document.createElement('div');
                var temp = document.createElement('p');
                var hour_text = document.createElement('p');
                temp.setAttribute('id', "1"+i);
                temp.setAttribute('class', "hour_temp");
                row.setAttribute('class', 'row');
                temp.textContent = data[i]["tMed"] + "ºC";
                hour_text.textContent = hour;
                hour_text.setAttribute('class', "hour_time");
                row.appendChild(temp);
                row.appendChild(hour_text);
                document.getElementById("innerTomorrow").appendChild(row);
                if (i+1 == time.split(':', 1)){
                    document.getElementById("table_temp").textContent = data[i]["tMed"] + "ºC";
                }
            }
        }
    }
}