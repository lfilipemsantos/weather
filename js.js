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
        switch_theme("escuro");
    }
    document.getElementById("home-button").classList.add("selected");
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"]);
        //document.getElementById("home-button").style.backgroundColor = "rgba(" + localStorage["color_theme"] + ", " + 0.5 + ")";
    }

    if(!(localStorage["local_id"])){
        localStorage["local_id"] = 1182100
    }

    if(!(localStorage["favorites"])) {
        var array = [];
        localStorage["favorites"] = JSON.stringify(array);
    }

    get_data(localStorage["local_id"]);
    
}


function build_locations(locations) {
    for(var i = 0; i<locations.length; i++) {
        for(var j = 0; j<locations[i]["localidade_distrito"].length; j++) {
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
    console.log("switching to " + id)
    var tabs = ["home-tab", "settings-tab", "location-tab", "favorites-tab"];
    show_bottom();
    for (let i = 0; i < tabs.length; i++) {
        if(tabs[i]!=id){
            document.getElementById(tabs[i]).classList.add("out");
            setTimeout(() => { document.getElementById(tabs[i]).style.display = "none"; document.getElementById(tabs[i]).classList.remove("out"); }, 150);
        }
    }
    if(id=="home-tab") {
        var home_icon = document.getElementById("home_icon").src.replace("not_","is_");
        document.getElementById("home_icon").src = home_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var fav_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = fav_icon;
    }
    else if(id=="settings-tab") {
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("not_","is_");
        document.getElementById("settings_icon").src = settings_icon;
        var fav_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = fav_icon;
    }
    else if(id=="favorites-tab") {
        clear_rows()
        build_favorites();
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var fav_icon = document.getElementById("favorites_icon").src.replace("not_","is_");
        document.getElementById("favorites_icon").src = fav_icon;
    }
    else if(id=="location-tab") {
        document.getElementById("location").focus();
        hide_bottom();
    }
    
    setTimeout(() => {  document.getElementById(id).style.display = "block"; }, 400);
    
    if(id!="location-tab"){
        document.getElementById("bottom-options").style.display = "block";
    }


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
            if(in_favorites(local_id)){
                document.getElementById("fav_icon_container").setAttribute("onclick", "rem_favorite('" + local_id + "')")
                if (localStorage["theme"]=="escuro") {
                    document.getElementById("fav_icon").src = "is_fav_w.svg";
                }
                else if (localStorage["theme"]=="claro") {
                    document.getElementById("fav_icon").src = "is_fav_b.svg";
                }
            }
            else {
                document.getElementById("fav_icon_container").setAttribute("onclick", "add_favorite('" + local_id + "')")
                if (localStorage["theme"]=="escuro") {
                    document.getElementById("fav_icon").src = "not_fav_w.svg";
                }
                else if (localStorage["theme"]=="claro") {
                    document.getElementById("fav_icon").src = "not_fav_b.svg";
                }
            }
        }
    }
}


function in_favorites(id) {
    favs = JSON.parse(localStorage["favorites"])
    for(i=0;i<favs.length; i++) {
        if(favs[i]["id"] == String(id)) {
            return true
        }
    }
    return false;
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
    var rows = ["innerToday", "innerTomorrow", "inner_next_days", "favorites-tab"];
    for (i=0; i<rows.length; i++) {
        var row = document.getElementById(rows[i]);
        while (row.firstChild) {
            row.removeChild(row.lastChild);
          }
    }
}


function build_table(current_day, current_hour) {
    var uv_scale = {
        1: "34px",
        2: "34px",
        3: "62px",
        4: "62px",
        5: "62px",
        6: "90px",
        7: "90px",
        8: "118px",
        9: "118px"
    }


    console.log(current_day)
    console.log(current_hour)
    if(current_hour) {
        console.log(weather_types[0][1])
        document.getElementById("table_temp").textContent = parseInt(current_hour["tMed"]) + "º";
        document.getElementById("weather-info-text").textContent = weather_types[0][current_hour["idTipoTempo"]]["PT"];
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
            console.log(text[i].id.replace("text-", ""));
            console.log(text[i].id);
            console.log(current_day)
            text[i].textContent = " " + parseInt(current_day[text[i].id.replace("text-", "")]) + "%";
        }
        else if(text[i].id.includes("tM")) {
            text[i].textContent = " " + parseInt(current_day[text[i].id.replace("text-", "")]) + "ºC";
        }
        else {
            text[i].textContent = " " + current_day[text[i].id.replace("text-", "")];
        }
    }
    document.getElementById("text-iUv").textContent = parseInt(current_day["iUv"]);
    document.getElementById("uv-indicator").style.marginLeft = uv_scale[parseInt(current_day["iUv"])]
    document.getElementById("text-probabilidadePrecipita").textContent = parseInt(current_day["probabilidadePrecipita"]);
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
            var hr = document.createElement('hr');
            hr.classList.add("row-divider");
            document.getElementById(inner_id).appendChild(hr);
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
        var hr = document.createElement('hr');
            hr.classList.add("row-divider");
            document.getElementById(inner_id).appendChild(hr);
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
    const DARK = "rgb(5, 5, 5)"
    const LIGHT = "rgb(245, 245, 245)"

    var buttons = ["home", "favorites", "settings"]


    if(id=="escuro"){
        document.body.style.backgroundColor = DARK;
        document.body.style.color = LIGHT;
        document.getElementById("location").style.color = LIGHT;
        document.getElementById("location").style.opacity="90%";
        document.getElementById("location").style.borderBottom="1px solid rgb(100, 100, 100)";
        document.getElementById("close_icon").src = "close_w.svg";
        document.getElementById("search_icon").src = "search_w.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(25, 25, 25)";
        document.getElementById("fav-notification-inner").style.backgroundColor = "rgb(40, 40, 40)";
        hr = document.getElementsByTagName("hr")
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = LIGHT;
        }
        
        document.getElementById("fav_icon").src.replace("b.svg", "w.svg");
        for(i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("b.svg", "w.svg");
        }
    }
    else if (id=="claro") {
        document.body.style.backgroundColor=LIGHT;
        document.body.style.color=DARK;
        document.getElementById("location").style.color=DARK;
        document.getElementById("location").style.opacity="90%";
        document.getElementById("location").style.borderBottom="1px solid black";
        document.getElementById("close_icon").src = "close_b.svg";
        document.getElementById("search_icon").src = "search_b.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(236, 236, 236)";
        document.getElementById("fav-notification-inner").style.backgroundColor = "rgb(206, 206, 206)";
        hr = document.getElementsByTagName("hr")
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = DARK;
        }
        document.getElementById("fav_icon").src.replace("w.svg", "b.svg");
        for(i=0; i<buttons.length; i++) {
            console.log(buttons[i] + "_icon")
            console.log(document.getElementById(buttons[i] + "_icon").src)
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("w.svg", "b.svg");
        }
    }
    
    localStorage["theme"] = id;
}


function switch_colors(color) {
    tables = document.getElementsByClassName("content_table");
    rows = document.getElementsByClassName("day_row");
    change_color(rows,"backgroundColor",color, 0.5);
    rows = document.getElementsByClassName("location-li");
    change_color(rows,"backgroundColor",color, 0.5);
    //document.getElementById("location").style.backgroundColor = "rgba(" + color + ", 0.5)";
    document.getElementById("apply-color-button").style.backgroundColor = "rgba(" + color + ", 0.1)";
    
    fav_rows = document.getElementsByClassName("fav_row");
    change_color(fav_rows,"backgroundColor",color, 0.2);

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
    document.getElementById("bottom-options").style.bottom = "-80px";
    setTimeout(
        function() {
            document.getElementById("bottom-options").style.display = "none";
        },
        300
    );
}
function show_bottom()  {
    document.getElementById("bottom-options").style.bottom = "0px";
    setTimeout(
        function() {
            document.getElementById("bottom-options").style.display = "block";
        },
        300
    );
}

function add_favorite(id) {
    document.getElementById("fav-notification").children[0].textContent = "Adicionado aos favoritos"
    document.getElementById("fav_icon_container").setAttribute("onclick", "")
    document.getElementById("fav-notification").style.top="20px"
    location_name = get_location_name(id);
    fav_list = JSON.parse(localStorage["favorites"])
    fav_item = {name: location_name, id: id};
    fav_list.push(fav_item)
    localStorage["favorites"] = JSON.stringify(fav_list);
    img_src = document.getElementById("fav_icon").src
    new_img_src = img_src.replace("not_", "is_");
    document.getElementById("fav_icon").src = new_img_src
    setTimeout(
        function() {
            document.getElementById("fav-notification").style.top="-90px"
            document.getElementById("fav_icon_container").setAttribute("onclick", "rem_favorite('" + id + "')")
        },
        2000
    );

}

function rem_favorite(id) {
    document.getElementById("fav-notification").children[0].textContent = "Removido dos favoritos"
    document.getElementById("fav_icon_container").setAttribute("onclick", "")
    document.getElementById("fav-notification").style.top="20px"
    console.log("removing from favorites...")
    fav_list = JSON.parse(localStorage["favorites"])
    for(i=0; i<fav_list.length; i++) {
        if (fav_list[i]["id"] == id) {
            fav_list.splice(i,1)
        }
    }
    localStorage["favorites"] = JSON.stringify(fav_list);
    console.log(fav_list)
    img_src = document.getElementById("fav_icon").src
    new_img_src = img_src.replace("is_", "not_");
    document.getElementById("fav_icon").src = new_img_src
    setTimeout(
        function() {
            document.getElementById("fav-notification").style.top="-90px"
            document.getElementById("fav_icon_container").setAttribute("onclick", "add_favorite('" + id + "')")
        },
        2000
    );
}

function build_favorites() {
    favorites = JSON.parse(localStorage["favorites"]);
    if(favorites.length>0) {
        console.log(favorites)
        for(i=0; i<favorites.length; i++) {
            var fav_row = document.createElement('div');

            var fav_location_container = document.createElement('div');
            fav_location_container.classList.add("fav_location_container");

            var fav_temp_container = document.createElement('div')
            fav_temp_container.classList.add("fav_temp_container");
            
            var fav_icon_container = document.createElement('div')
            fav_icon_container.classList.add("fav_icon_container");


            var temp = document.createElement('p');
            temp.setAttribute("id", "temp_" + favorites[i]["id"])
            fav_temp_container.appendChild(temp);

            var fav_location = document.createElement('p');
            fav_location.textContent = favorites[i]["name"]
            fav_location_container.appendChild(fav_location);

            var icon = document.createElement("img");
            icon.setAttribute("id", "icon_" + favorites[i]["id"])
            fav_icon_container.appendChild(icon);



            fav_row.setAttribute("onclick", "get_data('" + favorites[i]["id"] + "')" )
            fav_row.classList.add("fav_row");


            fav_row.appendChild(fav_location_container);
            fav_row.appendChild(fav_icon_container);
            fav_row.appendChild(fav_temp_container);

            set_current_temp(favorites[i]["id"]);

            document.getElementById("favorites-tab").appendChild(fav_row);
        }
    }
    else {
        console.log("no favorites :(")
    }
    switch_colors(localStorage['color_theme'])
}

function get_location_name(id) {
    for(i=0; i<locations.length; i++) {
        for (j=0; j<locations[i]["localidade_distrito"].length; j++) {
            if(String(id) == locations[i]["localidade_distrito"][j]["globalIdLocal"]) {
                return locations[i]["localidade_distrito"][j]["local"]
            }
        } 
    }
}


function set_current_temp(id) {
    //make request to api
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/" + id + ".json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL, true);
    request.responseType = 'json';
    request.send();

    request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE) {
            data = request.response;
            const today = new Date();
            var today_str = today.toISOString().slice(0,10);

            const time = (today.toLocaleTimeString("pt-PT")).split(':',1)[0];
        
            if(today.getHours()==0){
                today = today.setDate(today.getDate()+1);
                today_str = today.toISOString().slice(0,10);
            }

            for(i=0;i<data.length;i++) {
                if(data[i]["dataPrev"].split("T", 1) == today_str) {
                    var current_time = data[i]["dataPrev"].split("T",2)[1].split(":", 1)[0];
                    if (current_time == time) {
                        console.log(current_time)
                        console.log(data[i])
                        var icon = document.getElementById("icon_"+ id);
                        icon.src = get_weather_icon(current_time, data[i]["idTipoTempo"]);
                        document.getElementById("temp_"+ id).textContent = parseInt(data[i]["tMed"]) + "ºC";
                    }
                }
            }
        }
    }
}

function get_weather_icon(hour, num) {
    if(hour>21 || hour<6) {
        return "icons/n" + num + ".svg"
    }
    else {
        return "icons/d" + num + ".svg"
    }
}