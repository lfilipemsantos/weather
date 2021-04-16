function get_data() {
    var requestURL = "http://api.ipma.pt/open-data/forecast/meteorology/cities/daily/1010500.json"
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            console.log(request.response['data'][0]);
        }
    }
}