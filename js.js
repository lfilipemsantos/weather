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

            //fix response 
            if(data[0]["tMed"]){
                var temp = data[0];
                data[0] = data[1];
                data[1] = temp;
            }

            console.log(data);
            build_table();


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
                var weather_icon = document.createElement('img')
                weather_icon.setAttribute("class", "weather_icon")
                if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>21){
                    weather_icon.src = "icons/n" + parseInt(data[i]["idTipoTempo"]) + ".svg"
                }
                else {
                    weather_icon.src = "icons/d" + parseInt(data[i]["idTipoTempo"]) + ".svg"
                }
                temp.setAttribute('id', i);
                temp.setAttribute('class', "hour_temp");
                row.setAttribute('class', 'row');
                temp.textContent = data[i]["tMed"] + "ºC";
                hour_text.textContent = hour;
                hour_text.setAttribute('class', "hour_time");
                row.appendChild(temp);
                row.appendChild(weather_icon);
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
            var weather_icon = document.createElement('img')
            weather_icon.setAttribute("class", "weather_icon")
            if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>21){
                weather_icon.src = "icons/n" + parseInt(data[i]["idTipoTempo"]) + ".svg"
            }
            else {
                weather_icon.src = "icons/d" + parseInt(data[i]["idTipoTempo"]) + ".svg"
            }
            temp.setAttribute('id', "1"+23);
            temp.setAttribute('class', "hour_temp");
            row.setAttribute('class', 'row');
            temp.textContent = data[23]["tMed"] + "ºC";
            hour_text.textContent = hour;
            hour_text.setAttribute('class', "hour_time");
            row.appendChild(temp);
            row.appendChild(weather_icon);
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
                var weather_icon = document.createElement('img')
                if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>21){
                    weather_icon.src = "icons/n" + parseInt(data[i]["idTipoTempo"]) + ".svg"
                }
                else {
                    weather_icon.src = "icons/d" + parseInt(data[i]["idTipoTempo"]) + ".svg"
                }
                weather_icon.setAttribute("class", "weather_icon")
                temp.setAttribute('id', "1"+i);
                temp.setAttribute('class', "hour_temp");
                row.setAttribute('class', 'row');
                temp.textContent = data[i]["tMed"] + "ºC";
                hour_text.textContent = hour;
                hour_text.setAttribute('class', "hour_time");
                row.appendChild(temp);
                row.appendChild(weather_icon);
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

function build_table() {
    document.getElementById("table_temp").textContent = data[0]["tMax"] + "ºC";
    var icon_name = ["tMax", "iUv", "tMin", "probabilidadePrecipita"];
    for (let i = 0; i < icon_name.length; i++) {
        var icon = document.createElement('img');
        icon.src="icons/icons_table/"+ icon_name[i] + ".svg";
        icon.classList.add("table_icons")

        var text = document.createElement('p');
        if(icon_name[i] == "probabilidadePrecipita")
            text.textContent = " " + data[0][icon_name[i]] + "%";
        else {
            text.textContent = " " + data[0][icon_name[i]];
        }
        text.prepend(icon);
        document.getElementById(icon_name[i]).appendChild(text)
    }
}