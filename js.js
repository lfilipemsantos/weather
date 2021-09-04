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


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (localStorage["auto_theme"] == "on"){
        if (event.matches) {
            switch_theme("escuro")
        } 
        else {
            switch_theme("claro")        
        }
    }
})

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
                    console.log(n)
                    if (n>8 && n<22) {
                        reg.showNotification(notifTitle, options);
                        console.log(n)
                        console.log(typeof n)
                        console.log("setting timeout...")
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

function isIOSDevice(){
    return navigator.userAgent.toLowerCase().indexOf('safari/') > -1;
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
    console.log(cCoordinates)
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
                console.log(locations[i]["localidade_distrito"][j]["local"])
            }
        }
    }
    localStorage["nearest_location"] = nearest_location;
    console.log(nearest_location)
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

function switch_auto_theme(status) {
    localStorage["auto_theme"] = status;
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (userPrefersDark) {
        switch_theme("escuro");
    }
    else {
        switch_theme("claro");
    }
    
}


function init() {
    //Check if device is iOS (notifications do not work on iOS)
    if (isIOSDevice()) {
        console.log('This is a IOS device');
    } else {
        request_notification();
        getLocation();
        //display_notification();
    }

    build_locations(locations);
    
    if(!(localStorage["auto_theme"])){
        localStorage["auto_theme"] = "off"
    }
    
    if(localStorage["theme"]) {
        if (localStorage["auto_theme"] == "on"){
            const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (userPrefersDark) {
                switch_theme("escuro");
            }
            else {
                switch_theme("claro");
            }
        }
        else{
            switch_theme(localStorage["theme"]);
        }
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
            setTimeout(() => { document.getElementById(tabs[i]).style.display = "none"; document.getElementById(tabs[i]).classList.remove("out");
            if(id=="location-tab"){show_search();}else{hide_search()} }, 150);
        }
    }
    if(id=="home-tab") {
        var home_icon = document.getElementById("home_icon").src.replace("not_","is_");
        document.getElementById("home_icon").src = home_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("is_","not_");
        document.getElementById("settings_icon").src = settings_icon;
        var fav_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = fav_icon;
        document.getElementById("dynamic_background").style.display = "block";
    }
    else if(id=="settings-tab") {
        show_top_settings();
        var home_icon = document.getElementById("home_icon").src.replace("is_","not_");
        document.getElementById("home_icon").src = home_icon;
        var settings_icon = document.getElementById("settings_icon").src.replace("not_","is_");
        document.getElementById("settings_icon").src = settings_icon;
        var fav_icon = document.getElementById("favorites_icon").src.replace("is_","not_");
        document.getElementById("favorites_icon").src = fav_icon;
        document.getElementById("dynamic_background").style.display = "none";
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
        document.getElementById("dynamic_background").style.display = "none";
    }
    else if(id=="location-tab") {
        document.getElementById("location").focus();
        hide_bottom();
        document.getElementById("dynamic_background").style.display = "none";
    }
    
    setTimeout(() => {  document.getElementById(id).style.display = "block"; }, 400);
    
    if(id!="location-tab"){
        show_bottom();
    }


    return;
}


function show_search() {
    document.getElementById("hero_div").style.display = "block";
}

function hide_search() {
    document.getElementById("hero_div").style.display = "none";
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

            clear_rows();
            
            var days = build_arrays(data, today_str, tomorrow_str)
            console.log(data);
            build_rows(days);
            set_location_name(local_id); 
            switch_tab('home-tab');
            document.getElementById("location").value = "";
            console.log(local_id)
            if(in_favorites(local_id)){
                document.getElementById("fav_icon_container").setAttribute("onclick", "rem_favorite('" + local_id + "')")
                const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (localStorage["theme"]=="escuro") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "is_fav_w.svg";
                }
                else if (localStorage["theme"]=="claro") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "is_fav_b.svg";
                }
            }
            else {
                document.getElementById("fav_icon_container").setAttribute("onclick", "add_favorite('" + local_id + "')")
                if (localStorage["theme"]=="escuro") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "not_fav_w.svg";
                }
                else if (localStorage["theme"]=="claro") {
                    var fav = document.getElementById("fav_icon");
                    fav.src = fav.src = "not_fav_b.svg";
                }
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
        0: "-7px",
        1: "7px",
        2: "21px",
        3: "35px",
        4: "49px",
        5: "63px",
        6: "77px",
        7: "91px",
        8: "105px",
        9: "119px",
        10: "133px"
    }


    console.log(current_day)
    console.log(current_hour)
    if(current_hour) {
        console.log(weather_types[0][1])
        document.getElementById("table_temp").textContent = parseInt(current_hour["tMed"]) + "º";
        document.getElementById("weather-info-text").textContent = weather_types[0][current_hour["idTipoTempo"]]["PT"];
        text = document.getElementsByClassName("table-text")
        document.getElementById("text-iUv").textContent = Math.round(current_day["iUv"]);
        document.getElementById("uv-indicator").style.marginLeft = uv_scale[Math.round(current_day["iUv"])]
        document.getElementById("text-probabilidadePrecipita").textContent = Math.round(current_day["probabilidadePrecipita"]) + "%";
        document.getElementById("text-vento-dd").textContent = current_hour["ddVento"];
        document.getElementById("text-vento-vv").textContent = current_hour["ffVento"];
        document.getElementById("idFfxVento").textContent = wind_types[0][current_day["idFfxVento"]]["PT"];
    }
    else {
        text = document.getElementsByClassName("table-text-T")
        document.getElementById("text-iUv-T").textContent = Math.round(current_day["iUv"]);
        document.getElementById("uv-indicator-T").style.marginLeft = uv_scale[Math.round(current_day["iUv"])]
        document.getElementById("text-probabilidadePrecipita-T").textContent = Math.round(current_day["probabilidadePrecipita"]) + "%";
        document.getElementById("text-tMax-T").textContent = Math.round(current_day["tMax"]) + "º";
        document.getElementById("text-tMin-T").textContent = Math.round(current_day["tMin"]) + "º";
        document.getElementById("text-vento-dd-T").textContent = current_day["ddVento"];
        document.getElementById("text-vento-vv-T").textContent = current_day["ffVento"];
        document.getElementById("idFfxVento-T").textContent = wind_types[0][current_day["idFfxVento"]]["PT"];
    }
    try {
        document.getElementById("data-update").textContent = ("Última atualização: " + current_day["dataUpdate"]).replace("T", " às ")
    }
    catch {
        console.log('error')
    }
    
    for (let i = 0; i < text.length; i++) {
        console.log(text[i].id)
        if(text[i].id == "text-tMax") {
            text[i].textContent = "" + parseInt(current_day[text[i].id.replace("text-", "")]) + "º";
        }
        else if (text[i].id == "text-tMin"){
            text[i].textContent = "" + parseInt(current_day[text[i].id.replace("text-", "")]) + "º";
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
            temp.textContent = Math.round(days[j][i]["tMed"]) + "ºC";
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
        date.textContent = data[i]["dataPrev"].split("T",1)[0].split("-",3)[2] + "/" + data[i]["dataPrev"].split("T",1)[0].split("-",3)[1];
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
        //hr = document.createElement('hr');
        //hr.classList.add("nd_divider");
        //document.getElementById(inner_id).appendChild(hr);
    }
}


function set_theme_preference() {
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(userPrefersDark){
        
    }
}


function switch_theme(id) {
    const DARK = "rgb(5, 5, 5)"
    const LIGHT = "rgb(245, 245, 245)"

    var buttons = ["home", "favorites", "settings"]

    localStorage["theme"] = id;

    document.getElementById("selected_auto").style.display = "none";
    document.getElementById("selected_escuro").style.display = "none";
    document.getElementById("selected_claro").style.display = "none";

    if (localStorage["auto_theme"] == "on") {
        document.getElementById("selected_auto").style.display = "block";
    }
    else {
        
        document.getElementById("selected_" + id).style.display = "block";
    }

    if(id=="escuro"){
        document.querySelector('meta[name="theme-color"]').setAttribute('content', DARK);
        document.body.style.backgroundColor = DARK;
        document.body.style.color = LIGHT;
        document.getElementById("location").style.color = LIGHT;
        document.getElementById("location").style.opacity="90%";
        document.getElementById("location").style.borderBottom="1px solid rgb(100, 100, 100)";
        document.getElementById("close_icon").src = "close_w.svg";
        document.getElementById("search_icon").src = "search_w.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(15, 15, 15)";
        document.getElementById("fav-notification-inner").style.backgroundColor = "rgb(40, 40, 40)";
        document.getElementById("back_button").style.backgroundColor = "rgb(61, 61, 61)";
        hr = document.getElementsByClassName("row-divider");
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = LIGHT;
        }

        li = document.getElementsByClassName("location-li");
        for(i = 0; i<li.length; i++) {
            li[i].style.backgroundColor = "rgba(150, 150, 150, 0.2)";
        }
        
        
        var fav = document.getElementById("fav_icon");
        fav.src = fav.src.replace("b.svg", "w.svg");

        var refresh = document.getElementById("refresh_icon");
        refresh.src = refresh.src.replace("b.svg", "w.svg");

        for(i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("b.svg", "w.svg");
        }
    }
    else if (id=="claro") {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', LIGHT);
        document.body.style.backgroundColor=LIGHT;
        document.body.style.color=DARK;
        document.getElementById("location").style.color=DARK;
        document.getElementById("location").style.opacity="90%";
        document.getElementById("location").style.borderBottom="1px solid black";
        document.getElementById("close_icon").src = "close_b.svg";
        document.getElementById("search_icon").src = "search_b.svg";
        document.getElementById("bottom-options").style.backgroundColor = "rgb(236, 236, 236)";
        document.getElementById("fav-notification-inner").style.backgroundColor = "rgb(206, 206, 206)";
        document.getElementById("back_button").style.backgroundColor = "rgb(206, 206, 206)";
        hr = document.getElementsByClassName("row-divider");
        for(i = 0; i<hr.length; i++) {
            hr[i].style.backgroundColor = DARK;
        }

        li = document.getElementsByClassName("location-li");
        for(i = 0; i<li.length; i++) {
            li[i].style.backgroundColor = "rgba(206, 206, 206, 0.6)";
        }

        widgets = document.getElementsByClassName("widget");
        for(i = 0; i<widgets.length; i++) {
            widgets[i].style.color = LIGHT;
        }

        var fav = document.getElementById("fav_icon");
        fav.src = fav.src.replace("w.svg", "b.svg");
        
        var refresh = document.getElementById("refresh_icon");
        refresh.src = refresh.src.replace("w.svg", "b.svg");

        for(i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i] + "_icon")
            button.src = button.src.replace("w.svg", "b.svg");
        }
    }
    
}


function switch_colors(color) {
    tables = document.getElementsByClassName("content_table");
    //rows = document.getElementsByClassName("day_row");
    //change_color(rows,"backgroundColor",color, 0.2);
    //rows = document.getElementsByClassName("location-li");
    //change_color(rows,"backgroundColor",color, 0.5);
    //document.getElementById("location").style.backgroundColor = "rgba(" + color + ", 0.5)";
    document.getElementById("apply-color-button").style.backgroundColor = "rgba(" + color + ", 0.1)";
    
    fav_rows = document.getElementsByClassName("fav_row");
    change_color(fav_rows,"backgroundColor",color, 0.2);

    localStorage['color_theme'] = color
    show_action_notification("Cor de destaque alterada " + color)
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
    var input, filter, ul, li, div, i, txtValue;
    input = document.getElementById("location");
    filter = input.value.toUpperCase();
    ul = document.getElementById("location-list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        div = li[i].getElementsByTagName("div")[0];
        txtValue = div.textContent || a.innerText;
        console.log(txtValue)
        if (filter == "") {
            li[i].style.display = "none";
        }
        else {
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
    var fav_title = document.createElement("h2");
    fav_title.textContent = "Favoritos";
    fav_title.classList.add("tab-title");
    document.getElementById("favorites-tab").appendChild(fav_title);
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

            document.getElementById("favorites-tab").appendChild(fav_row);
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
            var today = new Date();
            var today_str = today.toISOString().slice(0,10);

            const time = (today.toLocaleTimeString("pt-PT")).split(':',1)[0];
        
            if(today.getHours()==0){
                console.log(today)
                today = today.setDate(today.getDate()+1);
                today_2 = new Date(today);
                console.log(today_2)
                today_str = today_2.toISOString().slice(0,10);
                console.log(today_str)
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
                        document.getElementById("info_"+ id).textContent = weather_types[0][data[i]["idTipoTempo"]]["PT"];
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
        tops[i].style.display = "block"
    }
    back_button = document.getElementById("back_button");
    back_button.style.display = "none"
}

function show_middle_settings(setting) {
    tops = document.getElementsByClassName("top-setting");
    for (i=0; i<tops.length; i++) {
        tops[i].style.display = "none"
    }
    middles = document.getElementsByClassName(setting);
    for (i=0; i<middles.length; i++) {
        middles[i].style.display = "block"
    }
    back_button = document.getElementById("back_button");
    back_button.style.display = "block"
}

function show_bottom_settings(setting) {
    middles = document.getElementsByClassName("top-setting");
    for (i=0; i<middles.length; i++) {
        middles[i].style.display = "none"
    }
    bottoms = document.getElementsByClassName(setting);
    for (i=0; i<bottoms.length; i++) {
        bottoms[i].style.display = "block"
    }
    back_button = document.getElementById("back_button");
    back_button.style.display = "block"
}

function reset_settings() {
    var local_items = ["color_theme", "theme", "auto_theme", "nearest_location", "favorites", "local_id"]
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