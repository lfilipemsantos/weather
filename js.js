// check serviceworker support in the browser
if ('serviceWorker' in navigator) {
    navigator
      .serviceWorker
      .register(
        'sw.js'
      )
      .then(function (reg) {
        console.log('Registration Successful');
      });
  }

function get_data() {
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/1182100.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    const current = new Date();
    const time = current.toLocaleTimeString("pt-PT");

    console.log(time.split(':', 1))
    console.log(time);

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            var no_data = new Array ( 0 , 24 , 49 );
            data = request.response
            console.log(data);

            //------------
            var uv_icon = document.createElement('img');
            uv_icon.src="077-uv-index.svg";
            uv_icon.classList.add("table_icons")

            var uv_text = document.createElement('p');
            uv_text.textContent = " " + data[0]["iUv"];
            uv_text.prepend(uv_icon);
            document.getElementById("uv").appendChild(uv_text)
            //-------------
            var tmax_icon = document.createElement('img');
            tmax_icon.src="080-hot.svg";
            tmax_icon.classList.add("table_icons")

            var tmax_text = document.createElement('p');
            tmax_text.textContent = " " + data[0]["tMax"];
            tmax_text.prepend(tmax_icon);
            document.getElementById("tmax").appendChild(tmax_text)
            document.getElementById("tmax").append(tmax_text)
            //-------------
            var tmin_icon = document.createElement('img');
            tmin_icon.src="014-cold.svg";
            tmin_icon.classList.add("table_icons")

            var tmin_text = document.createElement('p');
            tmin_text.textContent = " " + data[0]["tMin"];
            tmin_text.prepend(tmin_icon);
            document.getElementById("tmin").appendChild(tmin_text)
            document.getElementById("tmin").append(tmin_text)
            //-------------
            var prec_icon = document.createElement('img');
            prec_icon.src="076-umbrella.svg";
            prec_icon.classList.add("table_icons")

            var prec_text = document.createElement('p');
            prec_text.textContent = " " + data[0]["probabilidadePrecipita"] + "%";
            prec_text.prepend(prec_icon);
            document.getElementById("prec").appendChild(prec_text)
            document.getElementById("prec").append(prec_text)
            //-------------

            
            document.getElementById("table_temp").textContent = data[0]["tMax"] + "ºC";
            //document.getElementById("tmax").textContent = "TMax: " + data[0]["tMax"] + "ºC";
            //document.getElementById("tmin").textContent = "TMin: " + data[0]["tMin"] + "ºC";
            //document.getElementById("uv").textContent = " " + data[0]["iUv"];
            //document.getElementById("prec").textContent = "Precip.: " + data[0]["probabilidadePrecipita"] + "%";




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

function switch_tab(id) {
    console.log("id:" + id)
    var main = ["today", "tomorrow", "next_days"];
    for (let i = 0; i < main.length; i++) {
        document.getElementById(main[i]).style.display = "none";
        document.getElementById(main[i]+"_selector").classList.remove("selected");
    }
    document.getElementById(id).style.display = "block";
    document.getElementById(id+"_selector").classList.add("selected");
}