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
    build_locations(locations);

    if(localStorage["theme"]) {
        switch_theme(localStorage["theme"]);
    }
    else {
        switch_theme("claro");
    }
    document.getElementById("home-button").classList.add("selected");
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"]);
        document.getElementById("home-button").style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";

    }

    if(!(localStorage["local_id"])){
        localStorage["local_id"] = 1182100
    }

    get_data(localStorage["local_id"]);
}


function build_locations(locations) {
    for(var i = 0; i<locations.length; i++) {
        for(var j = 0; j<locations[i]["localidade_distrito"].length; j++) {
            console.log(locations[i]["localidade_distrito"][j])
            var li = document.createElement('li');
            var div = document.createElement('div');
            div.textContent = locations[i]["localidade_distrito"][j]["local"] + ", " + locations[i]["nome_distrito"] + " ";
            li.setAttribute("onclick", "get_data(" + locations[i]['localidade_distrito'][j]['globalIdLocal'] + ")");
            li.classList.add("location-li");
            li.appendChild(div);
            document.getElementById("location-list").appendChild(li)
        }
    }
}


function switch_tab(id) {
    console.log(id)
    var main = ["home-tab", "settings-tab", "location-tab"];
    for (let i = 0; i < main.length; i++) {
        if(main[i]!=id){
            console.log(main[i]);
            document.getElementById(main[i]).classList.add("out");
            setTimeout(() => { document.getElementById(main[i]).style.display = "none"; document.getElementById(main[i]).classList.remove("out"); }, 450);
        }
        
        //document.getElementById(main[i]).style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.1 + ")";
        /*try{
            document.getElementById("table_" + main[i]).style.display = "none";
        }
        catch{
            continue;
        }*/
    }
    setTimeout(() => {  document.getElementById(id).style.display = "block"; }, 600);
    
    if(id!="location-tab"){
        document.getElementById("bottom-options").style.display = "block";
    }
    //document.getElementById(id).style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";
    /*try{
        document.getElementById("table_" + id).style.display = "block";
    }
    catch{
        console.log('error')
    } */
    return;
}


function get_data(local_id) {
    //show_tab_buttons();
    show_bottom();
    localStorage["local_id"] = local_id;
    //make request to api
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/" + local_id + ".json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    //get today and tomorrow date as string
    const today = new Date();
    var today_str = today.toISOString().slice(0,10);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate()+1);
    console.log(today)
    console.log(tomorrow)
    
    var tomorrow_str = tomorrow.toISOString().slice(0,10);

    if(today.getHours()==0){
        today_str = tomorrow_str;
        tomorrow.setDate(tomorrow.getDate()+1);
        tomorrow_str = tomorrow.toISOString().slice(0,10);
    }

    console.log(today_str);
    console.log(tomorrow_str);

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            data = request.response;

            clear_rows();
            
            var days = build_arrays(data, today_str, tomorrow_str)
            console.log(data);
            build_rows(days);
            set_location_name(local_id); 
            switch_tab('home-tab');
            document.getElementById("location").value = "";
        }
    }
}


function set_location_name(local_id) {
    for(var i = 0; i<locations.length; i++) {
        for(var j = 0; j<locations[i]["localidade_distrito"].length; j++) {
            if(locations[i]["localidade_distrito"][j]["globalIdLocal"] == local_id) {
                document.getElementById("location-text").textContent = locations[i]["localidade_distrito"][j]["local"] + ", " + locations[i]["nome_distrito"]

                return;
            }
        }
    }
}


function clear_rows() {
    var rows = ["innerToday", "innerTomorrow", "inner_next_days"];
    for (i=0; i<rows.length; i++) {
        var row = document.getElementById(rows[i]);
        while (row.firstChild) {
            row.removeChild(row.lastChild);
          }
    }
}


function build_table(current_day, current_hour) {
    console.log(current_day)
    console.log(current_hour)
    if(current_hour) {
        document.getElementById("table_temp").textContent = parseInt(current_hour["tMed"]) + "ºC";
        text = document.getElementsByClassName("table-text")
    }
    else {
        text = document.getElementsByClassName("table-text-T")
    }
    try {
        document.getElementById("data-update").textContent = ("Última atualização: " + current_day["dataUpdate"]).replace("T", " às ")
    }
    catch {
        console.log('error')
    }
    
    for (let i = 0; i < text.length; i++) {
        if(text[i].id.includes("proba")) {
            text[i].textContent = " " + parseInt(current_day[text[i].id.replace("text-", "")]) + "%";
        }
        else if(text[i].id.includes("tM")) {
            text[i].textContent = " " + parseInt(current_day[text[i].id.replace("text-", "")]) + "ºC";
        }
        else {
            text[i].textContent = " " + current_day[text[i].id.replace("text-", "")];
        }
    }
}


function build_rows(days) {
    for(j=0;j<days.length;j++) {
        if(j==0){
            var inner_id = "innerToday";
        }
        else if(j==1) {
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
            temp.classList.add("hour_temp");
            row.classList.add('row');
            temp.textContent = days[j][i]["tMed"] + "ºC";
            hour_text.textContent = hour;
            hour_text.classList.add("hour_time");
            row.appendChild(temp);
            row.appendChild(weather_icon);
            row.appendChild(hour_text);
            document.getElementById(inner_id).appendChild(row);
        }
    }
    
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"]);
        //document.getElementById("today").style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";
    }
}


function build_arrays(data, today_str, tomorrow_str) {
    var today = new Array();
    var tomorrow = new Array();
    var next_days = new Array();

    var current_day;
    var current_hour;
    var next_day;

    const current = new Date();
    const time = (current.toLocaleTimeString("pt-PT")).split(':',1);

    for(i=0; i<data.length; i++) {
        var hour_split = data[i]["dataPrev"].split("T",2)[1].split(":");
        var hour = hour_split[0] + ":" + hour_split[1];

        if(!(data[i]["tMed"])) {
            next_days.push(data[i]);
        }
        if(!(data[i]["tMed"]) && data[i]["dataPrev"].includes(today_str)) {
            current_day = data[i];
        }
        else if(!(data[i]["tMed"]) && data[i]["dataPrev"].includes(tomorrow_str)) {
            next_day = data[i];
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
    build_next_days(next_days)

    return new Array(today, tomorrow);
}

function build_next_days(data) {
    var dict = {
        0: "Domingo",
        1: "Segunda-feira",
        2: "Terça-feira",
        3: "Quarta-feira",
        4: "Quinta-feira",
        5: "Sexta-feira",
        6: "Sábado",     
     };


    console.log(data);
    var inner_id = "inner_next_days";
    for(i=0; i<data.length; i++) {
        var row = document.createElement('div');
        var temp_container = document.createElement('div');
        var date_container = document.createElement('div');
        var icon_container = document.createElement('div');
        icon_container.classList.add("icon_container");
        var max = document.createElement('p');
        var min = document.createElement('p');
        var date = document.createElement('p');
        var week_day = document.createElement('small');
        var weather_icon = document.createElement('img');
        temp_container.classList.add("temp_container");
        date_container.classList.add("date_container");

        var date_day = new Date(data[i]["dataPrev"].split("T",1)[0]);
        week_day.textContent = dict[date_day.getDay()];
        
        weather_icon.setAttribute("class", "nd_weather_icon");
        weather_icon.setAttribute("alt", "weather_icon");
        weather_icon.src = "icons/d" + parseInt(data[i]["idTipoTempo"]) + ".svg";


        row.classList.add('day_row');
        date.textContent = data[i]["dataPrev"].split("T",1)[0];
        date.classList.add("date_prev")
        max.textContent = Math.round(data[i]["tMax"]) + "ºC";
        max.classList.add("max")
        min.textContent = Math.round(data[i]["tMin"]) + "ºC";
        min.classList.add("min")

        date_container.appendChild(date);
        date_container.appendChild(week_day);
        row.appendChild(date_container);
        icon_container.appendChild(weather_icon);
        row.appendChild(icon_container)
        temp_container.appendChild(max);
        temp_container.appendChild(min);
        row.append(temp_container);
        document.getElementById(inner_id).appendChild(row);
    }
}


function switch_theme(id) {
    if(id=="escuro"){
        document.body.style.backgroundColor = "rgb(37, 37, 37)";
        document.body.style.color = "rgb(245, 245, 245)";
        document.getElementById("location").style.color = "rgb(245, 245, 245)";
        document.getElementById("settings_icon").src = "settings_w.svg";
        document.getElementById("update_icon").src = "update_w.svg";
        document.getElementById("close_icon").src = "close_w.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(50, 50, 50)";
        hr = document.getElementsByTagName("hr")
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = "rgb(245, 245, 245)";
        }
    }
    else if (id=="claro") {
        document.body.style.backgroundColor="rgb(245, 245, 245)";
        document.body.style.color="rgb(37, 37, 37)";
        document.getElementById("location").style.color="rgb(37, 37, 37)";
        document.getElementById("settings_icon").src = "settings_b.svg";
        document.getElementById("update_icon").src = "update_b.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(206, 206, 206)";
        hr = document.getElementsByTagName("hr")
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = "rgb(37, 37, 37)";
        }
    }
    
    localStorage["theme"] = id;
}


function switch_colors(color) {
    buttons = document.getElementsByClassName("button");
    change_color(buttons,"backgroundColor", color, 0.1);
    change_color(buttons,"border", color, 0.5);
    tables = document.getElementsByClassName("content_table");
    //change_color(tables,"backgroundColor",color, 0.2)
    rows = document.getElementsByClassName("row");
    change_color(rows,"backgroundColor",color, 0.2);
    rows = document.getElementsByClassName("day_row");
    change_color(rows,"backgroundColor",color, 0.2);
    rows = document.getElementsByClassName("location-li");
    change_color(rows,"backgroundColor",color, 0.2);
    document.getElementById("location").style.backgroundColor = "rgba(" + color + ", 0.4)";
    //document.getElementById("about_row").style.backgroundColor = "rgba(" + color + ", 0.4)";
    document.getElementById("apply-color-button").style.backgroundColor = "rgba(" + color + ", 0.1)";

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


function set_rgb() {
    red = document.getElementById("red").value;
    green = document.getElementById("green").value;
    blue = document.getElementById("blue").value;

    var color_values = [red, green, blue];

    for (let i = 0; i < color_values.length; i++) {
        if (!(is_in_range(parseInt(color_values[i])))) {
            console.log(is_in_range(parseInt(color_values[i])))
            document.getElementById("color-warning").style.display = "block";
            setTimeout(
                function() {
                    document.getElementById("color-warning").style.display = "none";
                },
                2000
            );
            return;
        }
    }
    console.log(red);
    switch_colors(red + "," + green + "," + blue)
}


function is_in_range(value) {
    if (value >= 0 && value <= 255) {
        return true;
    }
    else {
        return false;
    }
}


function search_location() {
    switch_tab('location-tab');
    //hide_tab_buttons();
    hide_bottom();
    var input, filter, ul, li, div, i, txtValue;
    input = document.getElementById("location");
    filter = input.value.toUpperCase();
    ul = document.getElementById("location-list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        div = li[i].getElementsByTagName("div")[0];
        txtValue = div.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function hide_bottom()  {
    document.getElementById("bottom-options").style.display = "none";
}
function show_bottom()  {
    document.getElementById("bottom-options").style.display = "block";
}

/*function hide_tab_buttons() {
    document.getElementById("today").style.display = "none";
    document.getElementById("tomorrow").style.display = "none";
    document.getElementById("next_days").style.display = "none";
    document.getElementById("close").style.display = "block";
}

function show_tab_buttons() {
    document.getElementById("today").style.display = "inline-block";
    document.getElementById("tomorrow").style.display = "inline-block";
    document.getElementById("next_days").style.display = "inline-block";
    document.getElementById("close").style.display = "none";
    switch_tab('today');
}*/