/*function get_data() {
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/1182100.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            console.log(request.response)
            console.log(request.response['data'][0]);
            console.log(request.response['data'][1]);
            document.getElementById("max0").textContent = "Max: " + request.response['data'][0]["tMax"]
            document.getElementById("min0").textContent = "Min: " + request.response['data'][0]["tMin"]
        }
    }
}*/

function get_data() {
    var chart = new CanvasJS.Chart("chartContainer", {            
        title:{
            text: "Weekly Weather Forecast"              
        },
        axisY: {
            suffix: " °C",
            maximum: 40,
            gridThickness: 0
        },
        toolTip:{
            shared: true,
            content: "{name} </br> <strong>Temperature: </strong> </br> Min: {y[0]} °C, Max: {y[1]} °C"
        },
        data: [{
            type: "rangeSplineArea",
            fillOpacity: 0.1,
            color: "#91AAB1",
            indexLabelFormatter: formatter,
            dataPoints: [
                { label: "Monday", y: [15, 26], name: "rainy" },
                { label: "Tuesday", y: [15, 27], name: "rainy" },
                { label: "Wednesday", y: [13, 27], name: "sunny" },
                { label: "Thursday", y: [14, 27], name: "sunny" },
                { label: "Friday", y: [15, 26], name: "cloudy" },
                { label: "Saturday", y: [17, 26], name: "sunny" },
                { label: "Sunday", y: [16, 27], name: "rainy" }
            ]
        }]
    });
    chart.render();
}

function formatter(e) { 
	if(e.index === 0 && e.dataPoint.x === 0) {
		return " Min " + e.dataPoint.y[e.index] + "°";
	} else if(e.index == 1 && e.dataPoint.x === 0) {
		return " Max " + e.dataPoint.y[e.index] + "°";
	} else{
		return e.dataPoint.y[e.index] + "°";
	}
} 

function get_data() {
    var requestURL = "https://api.ipma.pt/public-data/forecast/aggregate/1182100.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            console.log(request.response)
            console.log(request.response['data'][0]);
            console.log(request.response['data'][1]);
            document.getElementById("max0").textContent = "Max: " + request.response['data'][0]["tMax"]
            document.getElementById("min0").textContent = "Min: " + request.response['data'][0]["tMin"]
        }
        var hour;
        for (hour = 0; hour < 24; hour++) {
            console.log(request.response[hour]);
        }
    }
}