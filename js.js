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

function data_request(id) {
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/" + id + ".json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL, true);
    request.responseType = 'json';
    request.send();
    return request
}


function request_notification() {
    Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
    });
}


function display_notification() {
    if (Notification.permission == 'granted') {
        navigator.serviceWorker.getRegistration().then(function(reg) {
            request = data_request(localStorage["local_id"])
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    data = request.response;
                    const notifTitle = get_location_name(localStorage["local_id"]);
                    const notifBody = "Máxima:" + data[0]["tMax"] + " | Mínima:" + data[0]["tMin"];
                    const notifImg = "png/039-sun.png";
                    const options = {
                        body: notifBody,
                        icon: notifImg,
                    };
                    var d = new Date();
                    var n = d.getHours();
                    if (n>8 && n<22) {
                        reg.showNotification(notifTitle, options);
                        setTimeout(display_notification, 600000);
                    }
                    else {
                        setTimeout(display_notification, 600000);
                    }
                }
            } 
        });
    }
}

function getLocation() {
    if (navigator.geolocation) {
        var options = {
            enableHighAccuracy: true
        };
        console.log(navigator.geolocation.getCurrentPosition(find_nearest_location, location_failed, options));
    } else { 
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function location_failed() {
    console.log("failed to get location")
}

function find_nearest_location(position) {
    var cCoordinates = position.coords;
    var cLat = cCoordinates.latitude;
    var cLon = cCoordinates.longitude;

    var nearest_location = "";
    var distance = 0;

    for(var i = 0; i<locations.length; i++) {
        for(var j = 0; j<locations[i]["localidade_distrito"].length; j++) {
            dist = calc_distance(cLat, cLon, locations[i]["localidade_distrito"][j]["latitude"], locations[i]["localidade_distrito"][j]["longitude"]);
            if (distance==0) {
                distance = dist
            }
            else if (dist < distance) {
                distance = dist;
                nearest_location = locations[i]["localidade_distrito"][j]["globalIdLocal"]
            }
        }
    }
    localStorage["nearest_location"] = nearest_location;
    get_data(localStorage['nearest_location'])
}

function calc_distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = to_rad(lat2-lat1);
    var dLon = to_rad(lon2-lon1);
    var lat1 = to_rad(lat1);
    var lat2 = to_rad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

function to_rad(Value){
    return Value * Math.PI / 180;
}


function init() {
    build_locations(locations);

    if (localStorage["theme"]) {
        switch_theme(localStorage["theme"])
    }
    else {
        switch_theme("dark")
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
    var tabs = ["home-tab", "settings-tab", "location-tab", "favorites-tab", "warnings-tab"];
    show_bottom();
    for (let i = 0; i < tabs.length; i++) {
        if(tabs[i]!=id){
            console.log(tabs[i])
            document.getElementById(tabs[i]).classList.add("out");
            setTimeout(() => { document.getElementById(tabs[i]).style.display = "none"; document.getElementById(tabs[i]).classList.remove("out");
            }, 150);
        }
    }

    tab_buttons = document.getElementsByClassName("tab-indicator");
    
    for (let i = 0; i < tab_buttons.length; i++) {
        tab_buttons[i].style.transform = "scaleX(0)";
        tab_buttons[i].style.opacity = "0";
    }

    if(id=="home-tab") {
        var home_icon = document.getElementById("home_icon").src.replace("not_","is_");
        document.getElementById("home_icon").src = home_icon;
        var search_icon = document.getElementById("search_icon").src.replace("is_","not_");
        document.getElementById("search_icon").src = search_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var favorites_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = favorites_icon;
        var warning_icon = document.getElementById("warning_icon").src.replace("is_","not_");
        document.getElementById("warning_icon").src = warning_icon;

        document.getElementById("home-button").setAttribute("onclick", "window.location.reload()")
        document.getElementById("home-button").classList.add("selected");
        document.getElementById("tab-indicator-home").style.transform = "scaleX(1)";
        document.getElementById("tab-indicator-home").style.opacity = "0.6";
    }
    else if(id=="settings-tab") {
        show_top_settings();
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var search_icon = document.getElementById("search_icon").src.replace("is_","not_");
        document.getElementById("search_icon").src = search_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("not_","is_");
        document.getElementById("settings_icon").src = settings_icon;
        var favorites_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = favorites_icon;
        var warning_icon = document.getElementById("warning_icon").src.replace("is_","not_");
        document.getElementById("warning_icon").src = warning_icon;

        document.getElementById("home-button").setAttribute("onclick", "switch_tab('home-tab')")
        document.getElementById("settings-button").classList.add("selected");
        document.getElementById("tab-indicator-settings").style.transform = "scaleX(1)";
        document.getElementById("tab-indicator-settings").style.opacity = "0.6";
    }
    else if(id=="favorites-tab") {
        clear_rows("favorites")
        build_favorites();
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var search_icon = document.getElementById("search_icon").src.replace("is_","not_");
        document.getElementById("search_icon").src = search_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var favorites_icon = document.getElementById("favorites_icon").src.replace("not_","is_");
        document.getElementById("favorites_icon").src = favorites_icon;
        var warning_icon = document.getElementById("warning_icon").src.replace("is_","not_");
        document.getElementById("warning_icon").src = warning_icon;

        document.getElementById("home-button").setAttribute("onClick", "switch_tab('home-tab')")
        document.getElementById("tab-indicator-favorites").style.transform = "scaleX(1)";
        document.getElementById("tab-indicator-favorites").style.opacity = "0.6";
    }
    else if(id=="location-tab") {
        document.getElementById("location").focus();
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var search_icon = document.getElementById("search_icon").src.replace("not_","is_");
        document.getElementById("search_icon").src = search_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var favorites_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = favorites_icon;
        var warning_icon = document.getElementById("warning_icon").src.replace("is_","not_");
        document.getElementById("warning_icon").src = warning_icon;

        document.getElementById("home-button").setAttribute("onClick", "switch_tab('home-tab')")
        document.getElementById("tab-indicator-search").style.transform = "scaleX(1)";
        document.getElementById("tab-indicator-search").style.opacity = "0.6";
    }
    else if(id=="warnings-tab") {
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var search_icon = document.getElementById("search_icon").src.replace("is_","not_");
        document.getElementById("search_icon").src = search_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var favorites_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = favorites_icon;
        var warning_icon = document.getElementById("warning_icon").src.replace("not_","is_");
        document.getElementById("warning_icon").src = warning_icon;

        document.getElementById("home-button").setAttribute("onClick", "switch_tab('home-tab')")
        document.getElementById("tab-indicator-warning").style.transform = "scaleX(1)";
        document.getElementById("tab-indicator-warning").style.opacity = "0.6";
    }
    
    setTimeout(() => {  document.getElementById(id).style.display = "block"; }, 400);
    
    if(id!="location-tab"){
        show_bottom();
    }


    return;
}


function get_data(local_id) {
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

            clear_rows("home");
            
            var days = build_arrays(data, today_str, tomorrow_str)
            console.log(data);
            build_rows(days);
            set_location_name(local_id); 
            switch_tab('home-tab');
            document.getElementById("location").value = "";
            desc = document.getElementById("fav-description");
            console.log(local_id)
            if(in_favorites(local_id)){
                document.getElementById("fav_icon_container").setAttribute("onclick", "rem_favorite('" + local_id + "')")
                if (localStorage["theme"]=="dark") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "is_favorite_w.svg";
                }
                else if (localStorage["theme"]=="light") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "is_favorite_b.svg";
                }
                desc.textContent = "Remover dos favoritos";
            }
            else {
                document.getElementById("fav_icon_container").setAttribute("onclick", "add_favorite('" + local_id + "')")
                if (localStorage["theme"]=="dark") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "not_favorite_w.svg";
                }
                else if (localStorage["theme"]=="light") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "not_favorite_b.svg";
                }
                desc.textContent = "Adicionar aos favoritos";
            }
        }
    }
}


function in_favorites(id) {
    favs = JSON.parse(localStorage["favorites"])
    for(i=0;i<favs.length; i++) {
        if(favs[i]["id"] == String(id)) {
            console.log("is in favorites")
            return true
        }
    }
    return false;
}


function get_location_name(id) {
    for(var i = 0; i<locations.length; i++) {
        for(var j = 0; j<locations[i]["localidade_distrito"].length; j++) {
            if(locations[i]["localidade_distrito"][j]["globalIdLocal"] == id) {
                return locations[i]["localidade_distrito"][j]["local"];
            }
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


function clear_rows(tab) {
    if (tab == "favorites") {
        var rows = ["favorites-tab"];
    }
    else if (tab == "favorites-settings") {
        var rows = ["fav-list"];
    }
    else if (tab == "home") {
        var rows = ["innerToday", "innerTomorrow", "inner_next_days"];
        var rows = ["innerToday", "inner_next_days"];
    }
    for (i=0; i<rows.length; i++) {
        var row = document.getElementById(rows[i]);
        while (row.firstChild) {
            row.removeChild(row.lastChild);
        }
    }
}


function build_table(current_day, current_hour) {
    var uv_scale = {
        0: "0%",
        1: "10%",
        2: "20%",
        3: "30%",
        4: "40%",
        5: "50%",
        6: "60%",
        7: "70%",
        8: "80%",
        9: "90%",
        10: "100%"
    }

    if(current_hour) {
        document.getElementById("table_temp").textContent = parseInt(current_hour["tMed"]) + "º";
        document.getElementById("weather-info-text").textContent = weather_types[0][current_hour["idTipoTempo"]]["PT"];
        text = document.getElementsByClassName("table-text")
        document.getElementById("text-iUv").textContent = Math.round(current_day["iUv"]);
        //document.getElementById("uv-indicator").style.marginLeft = uv_scale[Math.round(current_day["iUv"])]
        document.getElementById("text-probabilidadePrecipita").textContent = Math.round(current_day["probabilidadePrecipita"]) + "%";
        document.getElementById("text-temp").textContent = Math.round(current_day["tMax"]) + "º / " + Math.round(current_day["tMin"]) + "º";
        document.getElementById("text-vento-dd").textContent = current_hour["ddVento"];
        document.getElementById("text-vento-vv").textContent = Math.round(current_hour["ffVento"]) + "km/h";
        //document.getElementById("idFfxVento").textContent = wind_types[0][current_day["idFfxVento"]]["PT"];
    }
    else {
        text = document.getElementsByClassName("table-text-T")
        document.getElementById("text-iUv-T").textContent = Math.round(current_day["iUv"]);
        //document.getElementById("uv-indicator-T").style.marginLeft = uv_scale[Math.round(current_day["iUv"])]
        document.getElementById("text-probabilidadePrecipita-T").textContent = Math.round(current_day["probabilidadePrecipita"]) + "%";
        document.getElementById("text-temp-T").textContent = Math.round(current_day["tMax"]) + "º / " + Math.round(current_day["tMin"]) + "º";
        //document.getElementById("text-tMin-T").textContent = Math.round(current_day["tMin"]) + "º";
        document.getElementById("text-vento-dd-T").textContent = current_day["ddVento"];
        //document.getElementById("text-vento-vv-T").textContent = current_day["ffVento"];
        document.getElementById("idFfxVento-T").textContent = wind_types[0][current_day["idFfxVento"]]["PT"];
    }
    
    for (let i = 0; i < text.length; i++) {
        if(text[i].id == "text-tMax") {
            text[i].textContent = "" + parseInt(Math.round(current_day[text[i].id.replace("text-", "")])) + "º";
        }
        else if (text[i].id == "text-tMin"){
            text[i].textContent = "" + parseInt(Math.round(current_day[text[i].id.replace("text-", "")])) + "º";
        }
    }
    
}


function build_rows(days) {
    for(j=0; j<days.length; j++) {
        var inner_id = "innerToday";
        /*if(j==0){
            var inner_id = "innerToday";
        }
        else if(j==1) {
            var inner_id = "innerTomorrow";
        }*/
        for(i=0;i<days[j].length;i++) {
            var hour_split = days[j][i]["dataPrev"].split("T",2)[1].split(":");
            var hour = hour_split[0] + ":" + hour_split[1];
            
            var row = document.createElement('div');
            var temp = document.createElement('p');
            var hour_text = document.createElement('p');
            var weather_icon = document.createElement('img');
            var weather_icon_container = document.createElement('div');
            weather_icon.setAttribute("class", "weather_icon");
            weather_icon.setAttribute("alt", "weather_icon");
            weather_icon_container.setAttribute("class", "weather_icon_container");


            if(i==0 && j == 0) {
                if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>20) {
                    document.getElementById("current-weather").src = "icons_png/n" + parseInt(days[j][i]["idTipoTempo"]) + ".png";
                }
                else {
                    document.getElementById("current-weather").src = "icons_png/d" + parseInt(days[j][i]["idTipoTempo"]) + ".png";
                }
            }

            if (parseInt(hour.split(":"))<6 || parseInt(hour.split(":"))>20) {
                weather_icon.src = "icons_png/n" + parseInt(days[j][i]["idTipoTempo"]) + ".png";
            }
            else {
                weather_icon.src = "icons_png/d" + parseInt(days[j][i]["idTipoTempo"]) + ".png";
            }
            temp.setAttribute('id', i);
            temp.classList.add("hour_temp");
            row.classList.add('row');
            temp.textContent = Math.round(days[j][i]["tMed"]) + "ºC";
            hour_text.textContent = hour;
            hour_text.classList.add("hour_time");
            row.appendChild(hour_text);
            weather_icon_container.appendChild(weather_icon);
            row.appendChild(weather_icon_container);
            row.appendChild(temp);
            document.getElementById(inner_id).appendChild(row);

        }
    }
    
    if(localStorage["color_theme"]) {
        switch_colors(localStorage["color_theme"], false);
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
        var date = document.createElement('small');
        var week_day = document.createElement('small');
        var weather_icon = document.createElement('img');
        temp_container.classList.add("temp_container");
        date_container.classList.add("date_container");

        var date_day = new Date(data[i]["dataPrev"].split("T",1)[0]);
        week_day.textContent = dict[date_day.getDay()];
        if(i==0) {
            document.getElementById("date-text").textContent = dict[date_day.getDay()]
        }
        
        weather_icon.setAttribute("class", "nd_weather_icon");
        weather_icon.setAttribute("alt", "weather_icon");
        weather_icon.src = "icons_png/d" + parseInt(data[i]["idTipoTempo"]) + ".png";


        row.classList.add('day_row');
        date.textContent = data[i]["dataPrev"].split("T",1)[0].split("-",3)[2] + "/" + data[i]["dataPrev"].split("T",1)[0].split("-",3)[1];
        date.classList.add("date_prev")
        max.textContent = Math.round(data[i]["tMax"]) + "º";
        max.classList.add("max")
        min.textContent = Math.round(data[i]["tMin"]) + "º";
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
    const DARK = "#121212"
    const LIGHT = "#ffffff"

    
    let theme_color = localStorage['color_theme']
    document.getElementById("theme").setAttribute('href', `themes/${id}-${theme_color}.css`);

    var buttons = ["home", "favorites", "settings", "search", "warning"]

    localStorage["theme"] = id;

    document.getElementById("selected_dark").style.display = "none";
    document.getElementById("selected_light").style.display = "none";

    if (localStorage["auto_theme"] == "on") {
        document.getElementById("selected_auto").style.display = "block";
    }
    else {
        
        document.getElementById("selected_" + id).style.display = "block";
    }

    if(id=="dark"){
        document.querySelector('meta[name="theme-color"]').setAttribute('content', DARK);

        /*var setting_icons = document.getElementsByClassName("setting-icon");
        for(i = 0; i<setting_icons.length; i++) {
            setting_icons[i].src = setting_icons[i].src.replace("_b", "_w");
        }*/
    
        
        var location_icon = document.getElementById("current-location-icon")
        location_icon.src = location_icon.src.replace("b.svg", "w.svg");
        
        var fav = document.getElementById("fav_icon");
        fav.src = fav.src.replace("b.svg", "w.svg");

        for(i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("b.svg", "w.svg");
        }
    }

    else if (id=="light") {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', LIGHT);

        var location_icon = document.getElementById("current-location-icon")
        location_icon.src = location_icon.src.replace("w.svg", "b.svg");

        var fav = document.getElementById("fav_icon");
        fav.src = fav.src.replace("w.svg", "b.svg");

        for(i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("w.svg", "b.svg");
        }
    }
    
}


function switch_colors(color, notification) {
    localStorage['color_theme'] = color

    let theme = localStorage["theme"]
    let theme_color = localStorage['color_theme']

    document.getElementById("theme").setAttribute('href', `themes/${theme}-${theme_color}.css`);

    if (notification){
        show_action_notification("Cor de destaque alterada")
    }
}


function change_color(obj, element, color, transparency) {
    for (var i = 0; i < obj.length; i++) {
        if (element == "backgroundColor"){
            obj[i].style.backgroundColor = "rgba(" + color + ", " + transparency +")";
        }
        else if (element == "border") {
            obj[i].style.border = "rgba(" + color + ", " + transparency +") 1px solid";
        }
        else if (element == "border-bottom") {
            obj[i].style.borderBottom = "rgba(" + color + ", " + transparency +") 2px solid";
        }
        else if (element == "color") {
            obj[i].style.color = "rgba(" + color + ", " + transparency +")";
        }
    }
}


function search_location() {
    //switch_tab('location-tab');
    var input, filter, ul, li, div, i, txtValue;
    input = document.getElementById("location");
    filter = input.value.toUpperCase();
    ul = document.getElementById("location-list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        div = li[i].getElementsByTagName("div")[0];
        txtValue = div.textContent || a.innerText;
        if (!filter) {
            li[i].style.display = "none";
            //document.getElementById("search_container").style.width = "70%";
            //document.getElementById("current-location-button").style.display = "inline-block";
        }
        else {
            //document.getElementById("current-location-button").style.display = "none";
            //document.getElementById("search_container").style.width = "90%";
            
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "block";
            } else {
                li[i].style.display = "none";
            }
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
    desc = document.getElementById("fav-description")
    desc.textContent = "Remover dos favoritos"
    document.getElementById("fav_icon").src = new_img_src;
    setTimeout(
        function() {
            document.getElementById("fav-notification").style.top="-90px"
            document.getElementById("fav_icon_container").setAttribute("onclick", "rem_favorite('" + id + "')")
        },
        2000
    );

}

function remove_from_fav(id) {
    fav_list = JSON.parse(localStorage["favorites"]);
    for(i=0; i<fav_list.length; i++) {
        if (fav_list[i]["id"] == id) {
            fav_list.splice(i,1);
        }
    }
    localStorage["favorites"] = JSON.stringify(fav_list);
    clear_rows("favorites-settings")
    load_fav_settings();
}

function rem_favorite(id) {
    document.getElementById("fav-notification").children[0].textContent = "Removido dos favoritos";
    document.getElementById("fav_icon_container").setAttribute("onclick", "");
    document.getElementById("fav-notification").style.top="20px";
    remove_from_fav(id);
    img_src = document.getElementById("fav_icon").src
    new_img_src = img_src.replace("is_", "not_");
    desc = document.getElementById("fav-description")
    desc.textContent = "Adicionar aos favoritos"
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
    var fav_title = document.createElement("h2");
    fav_title.textContent = "Favoritos";
    fav_title.classList.add("tab-title");
    document.getElementById("favorites-tab").appendChild(fav_title);
    var fav_container = document.createElement("div");
    fav_container.id = "fav_container"
    document.getElementById("favorites-tab").appendChild(fav_container);
    if(favorites.length>0) {
        for(i=0; i<favorites.length; i++) {
            var fav_row = document.createElement('div');

            var fav_location_container = document.createElement('div');
            fav_location_container.classList.add("fav_location_container");

            var fav_temp_container = document.createElement('div')
            fav_temp_container.classList.add("fav_temp_container");
            
            var fav_icon_container = document.createElement('div')
            fav_icon_container.classList.add("fav_row_icon_container");

            var weather_info_container = document.createElement('div')
            weather_info_container.classList.add("fav_info_container");


            var temp = document.createElement('p');
            temp.setAttribute("id", "temp_" + favorites[i]["id"])
            fav_temp_container.appendChild(temp);

            var fav_location = document.createElement('p');
            fav_location.textContent = favorites[i]["name"]
            fav_location_container.appendChild(fav_location);

            var icon = document.createElement("img");
            icon.setAttribute("id", "icon_" + favorites[i]["id"])
            fav_icon_container.appendChild(icon);

            var weather_info = document.createElement('small');
            weather_info.setAttribute("id", "info_" + favorites[i]["id"])
            weather_info_container.appendChild(weather_info);


            fav_row.setAttribute("onclick", "get_data('" + favorites[i]["id"] + "')" )
            fav_row.classList.add("fav_row");


            fav_row.appendChild(fav_location_container);
            fav_row.appendChild(weather_info_container);
            fav_row.appendChild(fav_temp_container);
            fav_row.appendChild(fav_icon_container);

            set_current_temp(favorites[i]["id"]);

            document.getElementById("fav_container").appendChild(fav_row);
        }
    }
    else {
        var no_fav_div = document.createElement('div');
        var no_fav_text = document.createElement('p');
        no_fav_text.setAttribute("id", "no_fav_text");
        no_fav_div.setAttribute("id", "no_fav_div");
        no_fav_text.textContent = "Experimente adicionar um local aos favoritos"

        no_fav_div.appendChild(no_fav_text);
        document.getElementById("favorites-tab").appendChild(no_fav_div);
        
    }
    switch_colors(localStorage['color_theme'], false)
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
            var today = new Date();
            var today_str = today.toISOString().slice(0,10);

            const time = (today.toLocaleTimeString("pt-PT")).split(':',1)[0];
        
            if(today.getHours()==0){
                today = today.setDate(today.getDate()+1);
                today_2 = new Date(today);
                today_str = today_2.toISOString().slice(0,10);
            }

            for(i=0;i<data.length;i++) {
                if(data[i]["dataPrev"].split("T", 1) == today_str) {
                    var current_time = data[i]["dataPrev"].split("T",2)[1].split(":", 1)[0];
                    if (current_time == time) {
                        var icon = document.getElementById("icon_"+ id);
                        icon.src = get_weather_icon(current_time, data[i]["idTipoTempo"]);
                        document.getElementById("temp_"+ id).textContent = parseInt(data[i]["tMed"]) + "ºC";
                        document.getElementById("info_"+ id).textContent = weather_types[0][data[i]["idTipoTempo"]]["PT"];
                    }
                }
            }
        }
    }
}

function get_weather_icon(hour, num) {
    if(hour>20 || hour<6) {
        return "icons_png/n" + num + ".png"
    }
    else {
        return "icons_png/d" + num + ".png"
    }
}

function show_top_settings() {
    bottoms = document.getElementsByClassName("bottom-setting");
    for (i=0; i<bottoms.length; i++) {
        bottoms[i].style.display = "none"
    }
    middles = document.getElementsByClassName("middle-setting");
    for (i=0; i<middles.length; i++) {
        middles[i].style.display = "none"
    }
    tops = document.getElementsByClassName("top-setting");
    for (i=0; i<tops.length; i++) {
        tops[i].style.display = "flex"
    }
    back_button = document.getElementById("back_button");
    back_button.style.display = "none"
}


function load_fav_settings() {
    favorites = JSON.parse(localStorage["favorites"]);
    if(favorites.length>0) {
        for(i=0; i<favorites.length; i++) {
            var fav_setting_row = document.createElement("div");
            fav_setting_row.classList.add("fav_setting_row")
            var fav_setting_remove = document.createElement("div");
            fav_setting_remove.setAttribute("onclick", "remove_from_fav('" + favorites[i]["id"] + "')")
            var fav_setting_name = document.createElement("div");
            fav_setting_name.textContent = favorites[i]["name"];
            fav_setting_remove.textContent = "x";
            fav_list = document.getElementById("fav-list");
            fav_setting_row.appendChild(fav_setting_remove);
            fav_setting_row.appendChild(fav_setting_name);
            fav_list.appendChild(fav_setting_row);
        }
    }
}

function show_bottom_settings(setting) {
    middles = document.getElementsByClassName("top-setting");
    for (i=0; i<middles.length; i++) {
        middles[i].style.display = "none"
    }

    if (setting == "fav_settings") {
        clear_rows("favorites-settings");
        load_fav_settings();
    }

    bottoms = document.getElementsByClassName(setting);
    for (i=0; i<bottoms.length; i++) {
        bottoms[i].style.display = "block"
    }
    back_button = document.getElementById("back_button");
    back_button.style.display = "block"
}

function reset_settings() {
    var local_items = ["color_theme", "theme", "auto_theme", "nearest_location", "favorites", "local_id", "home_color"]
    for (i=0; i<local_items.length; i++) {
        localStorage.removeItem(local_items[i]);
    }
    show_action_notification("Definições repostas")
    init();
}

function show_action_notification(text_content) {
    document.getElementById("fav-notification").children[0].textContent = text_content;
    document.getElementById("fav-notification").style.top="20px"
    setTimeout(
        function() {
            document.getElementById("fav-notification").style.top="-90px"
        },
        2000
    );
}

function switch_indicator(id) {
    var indicators = ["i_s1", "i_s2"]
    for (i=0; i<indicators.length; i++) {
        var ind = document.getElementById(indicators[i])
        ind.classList.remove("selected");
    }
    indicator = document.getElementById(id)
    indicator.classList.add('selected');
}

/*function switch_home_color() {
    if (localStorage["home_color"] == "on") {
        localStorage["home_color"] = "off"
        //document.getElementById("dynamic_background").style.opacity = 0;
        document.getElementById("switch_home_color_button").style.backgroundColor = "rgba(0,0,0,0)";
    }
    else {
        localStorage["home_color"] = "on"
        document.getElementById("dynamic_background").style.opacity = 1;
        document.getElementById("switch_home_color_button").style.backgroundColor = "rgba(" + localStorage['color_theme'] + ", 0.5)";
    }
}*/
