if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
}

function init() {
    if(localStorage["theme"]) {
        switch_theme(localStorage["theme"]);
    }
    else {
        switch_theme("claro");
    }
    get_data();
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"]);
        document.getElementById("today").style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";

    }
    
}


function switch_tab(id) {
    var main = ["today", "tomorrow", "next_days", "settings", "about"];
    for (let i = 0; i < main.length; i++) {
        document.getElementById(main[i] + "_row").style.display = "none";
        document.getElementById(main[i]).style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.1 + ")";
        try{
            document.getElementById("table_" + main[i]).style.display = "none";
        }
        catch{
            continue;
        }
    }
    document.getElementById(id + "_row").style.display = "block";
    document.getElementById(id).style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";
    try{
        document.getElementById("table_" + id).style.display = "block";
    }
    catch{
        console.log('error')
    }
    
}

function get_data() {

    //make request to api
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/1182100.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    //get today and tomorrow date as string
    const current = new Date();
    var today_str = current.toISOString().slice(0,10);
    current.setDate(current.getDate() +1);
    var tomorrow_str = current.toISOString().slice(0,10);

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            var no_data = new Array ( 0 , 24 , 49 );
            data = request.response;


            var days = build_arrays(data, today_str, tomorrow_str)
            console.log(data);
            build_rows(days);
        }
    }
}

function build_table(current_day, current_hour) {
    if(current_hour) {
        document.getElementById("table_temp").textContent = current_hour["tMed"] + "ºC";
        var icon_name = ["tMax", "iUv", "tMin", "probabilidadePrecipita"];
    }
    else {
        var icon_name = ["tMaxT", "iUvT", "tMinT", "probabilidadePrecipitaT"];
    }
    document.getElementById("data_update").textContent = ("Última atualização: " + current_day["dataUpdate"]).replace("T", " às ")
    
    

    for (let i = 0; i < icon_name.length; i++) {
        var icon = document.createElement('img');
        icon.setAttribute("alt", icon_name[i]);
        icon.src=("icons/icons_table/"+ icon_name[i] + ".svg").replace("T", "");
        icon.classList.add("table_icons")

        var text = document.createElement('p');
        if(icon_name[i].includes("proba")) {
            text.textContent = " " + current_day[icon_name[i].replace("T", "")] + "%";
        }
        else if(icon_name[i].includes("tM")) {
            text.textContent = " " + current_day[icon_name[i].replace("T", "")] + "ºC";
        }
        else {
            text.textContent = " " + current_day[icon_name[i].replace("T", "")];
        }
        text.prepend(icon);
        document.getElementById(icon_name[i]).appendChild(text);
    }
}

function build_rows(days) {
    for(j=0;j<days.length;j++) {
        if(j==0){
            var row_id = "today";
            var inner_id = "innerToday";
        }
        else if(j==1) {
            var row_id = "tomorrow";
            var inner_id = "innerTomorrow";
        }
        for(i=0;i<days[j].length;i++) {
            var hour_split = days[j][i]["dataPrev"].split("T",2)[1].split(":");
            var hour = hour_split[0] + ":" + hour_split[1];
            
            var row = document.createElement('div');
            var temp = document.createElement('p');
            var hour_text = document.createElement('p');
            var weather_icon = document.createElement('img');
            weather_icon.setAttribute("class", "weather_icon");
            weather_icon.setAttribute("alt", "weather_icon");
            if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>21) {
                weather_icon.src = "icons/n" + parseInt(days[j][i]["idTipoTempo"]) + ".svg";
            }
            else {
                weather_icon.src = "icons/d" + parseInt(days[j][i]["idTipoTempo"]) + ".svg";
            }
            temp.setAttribute('id', i);
            temp.setAttribute('class', "hour_temp");
            row.setAttribute('class', 'row');
            temp.textContent = days[j][i]["tMed"] + "ºC";
            hour_text.textContent = hour;
            hour_text.setAttribute('class', "hour_time");
            row.appendChild(temp);
            row.appendChild(weather_icon);
            row.appendChild(hour_text);
            document.getElementById(inner_id).appendChild(row);
        }
    }

    
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"]);
        document.getElementById("today").style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";

    }
}

function build_arrays(data, today_str, tomorrow_str) {
    var today = new Array();
    var tomorrow = new Array();

    var current_day;
    var current_hour;
    var next_day;

    const current = new Date();
    const time = (current.toLocaleTimeString("pt-PT")).split(':',1);

    for(i=0; i<data.length; i++) {
        var hour_split = data[i]["dataPrev"].split("T",2)[1].split(":");
        var hour = hour_split[0] + ":" + hour_split[1];

        if(!(data[i]["tMed"]) && data[i]["dataPrev"].includes(today_str)) {
            current_day = data[i];
        }
        else if(!(data[i]["tMed"]) && data[i]["dataPrev"].includes(tomorrow_str)) {
            next_day = data[i];
        }
        else if(!(data[i]["tMed"])) {
            continue;
        }
        else{
            if(data[i]["dataPrev"].includes(today_str)) {

                if (parseInt(hour.split(":"))<parseInt(time)) {
                    continue;
                }
                else {
                    today.push(data[i]);
                    if (parseInt(hour.split(":"))==parseInt(time)) {
                        current_hour = data[i];
                    }
                }
            }
            else if(data[i]["dataPrev"].includes(tomorrow_str)) {
                tomorrow.push(data[i]);
            }
        }
    }

    build_table(current_day, current_hour);
    build_table(next_day, null);

    return new Array(today, tomorrow);
}

function switch_theme(id) {
    if(id=="escuro"){
        document.body.style.backgroundColor="rgb(37, 37, 37)";
        document.body.style.color="rgb(245, 245, 245)";
        document.getElementById("settings_icon").src = "settings_w.svg";
    }
    else if (id=="claro") {
        document.body.style.backgroundColor="rgb(245, 245, 245)";
        document.body.style.color="rgb(37, 37, 37)";
        document.getElementById("settings_icon").src = "settings_b.svg";
    }
    
    localStorage["theme"] = id;
}

function switch_colors(color) {
    buttons = document.getElementsByClassName("button");
    change_color(buttons,"backgroundColor", color, 0.1)
    change_color(buttons,"border", color, 0.5)
    tables = document.getElementsByClassName("content_table");
    change_color(tables,"backgroundColor",color, 0.2)
    rows = document.getElementsByClassName("row");
    change_color(rows,"backgroundColor",color, 0.2)
    document.getElementById("location_search").style.backgroundColor = "rgba(" + color + ", 0.4)";

    localStorage['color_theme'] = color
}

function change_color(obj, element, color, transparency) {
    for (var i = 0; i < obj.length; i++) {
        if (element == "backgroundColor"){
            obj[i].style.backgroundColor = "rgba(" + color + ", " + transparency +")";
        }
        else if (element == "border") {
            obj[i].style.border = "rgba(" + color + ", " + transparency +") 1px solid";
        }
    }
}