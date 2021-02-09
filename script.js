//api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=hourly,minutely,alerts&units=imperial&appid={API key}
//set up some vars.
var searchBar = document.getElementById("searchBar")
var searchBtn = document.getElementById("search-button")
var search = document.querySelector(".recentSearches")
var query;
var apiKey = "bd3c44058def70942aed89d8d659995f"
var recentSearches;
var cityName;
//check storage
recentSearches = JSON.parse(localStorage.getItem("recentSearches"))
if (!recentSearches) {
    recentSearches = {
        searches: []
    }
} else {
    // if something is there query most recent city, and populate recent searches
    populateRecentSearches(recentSearches.searches)
    queryAPIAndDoEverything(recentSearches.searches[0])
}

//grab query on search button click
searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    query = searchBar.value;
    searchBar.value = ""
    console.log(query);
    queryAPIAndDoEverything(query);
});

//grab query from recent search button click
search.addEventListener("click", function (event) {
    event.preventDefault();
    searchBar.value = ""

    queryAPIAndDoEverything(event.target.dataset.name);

})

//What is says on the tin
function queryAPIAndDoEverything(query) {
    //Query this API for the lat/lon, and nicely formatted city name
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + query + "&appid=" + apiKey)
        .then((response) => response.json()).then(data => {
            // console.log(data);
            cityName = data.name
            //continue if it comes back as a 200
            if (data.cod === 200) {
                //add to recent searches and store
                if (!recentSearches.searches.includes(cityName)) { recentSearches.searches.unshift(cityName) }
                if (recentSearches.searches.length > 10) { recentSearches.searches.pop(); }
                localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
                //repopulate recent searches
                populateRecentSearches(recentSearches.searches)
                // console.log(recentSearches.searches)
                //use lat and lon to get all the data
                fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&exclude=hourly,minutely,alerts&units=imperial&appid=" + apiKey).then(response => response.json()).then(data => {
                    //set a var to current day's forecast
                    var todaysForecast = data.daily[0]
                    //use moment to turn the ms into the formatted date
                    var momentObj = moment.unix(todaysForecast.dt).format("M/D/YYYY")
                    //Set up the title of today's forecast
                    document.querySelector(".cityAndDay").textContent = cityName + " " + momentObj + " " + figureEmoji(todaysForecast.weather[0].main);
                    //get an avg temp for the day
                    var todayAvgTemp = Math.floor((todaysForecast.temp.max + todaysForecast.temp.min) / 2)
                    //populate the various current day's forecast things
                    document.querySelector(".todayTemp").innerHTML = todayAvgTemp + " F°"
                    document.querySelector(".todayHumidity").innerHTML = todaysForecast.humidity
                    document.querySelector(".todayWindspeed").innerHTML = todaysForecast.wind_speed + " MPH"
                    document.querySelector(".todayUV").innerHTML = todaysForecast.uvi
                    document.querySelector(".todayUV").setAttribute("style", "background-color: " + figureUVIColour(todaysForecast.uvi) + ";")
                    //set up vars for populating the 5 day forecast
                    var singleDaysForecast;
                    var singleDaysDate;
                    var singleDaysTemp;
                    var singleDaysText = "";
                    //loop through the days
                    for (let index = 1; index < 6; index++) {
                        //set something to the current forecast we're using
                        singleDaysForecast = data.daily[index];
                        //use moment to format the date nicely
                        singleDaysDate = moment.unix(singleDaysForecast.dt).format("M/D/YYYY");
                        //populate the single day's date.
                        //Add 1 to index because I wrote the HTML first.
                        document.querySelector(".day" + (index + 1) + "Header").innerHTML = singleDaysDate;
                        //add to single day's text content with all the relevant info
                        singleDaysText = singleDaysText + figureEmoji(singleDaysForecast.weather[0].main) + " \n ";
                        singleDaysTemp = Math.floor((singleDaysForecast.temp.max + singleDaysForecast.temp.min) / 2);
                        singleDaysText = singleDaysText + "Temp: " + singleDaysTemp + " F° \n";
                        singleDaysText = singleDaysText + "Humidity: " + singleDaysForecast.humidity
                        //set the current day's text
                        document.querySelector(".day" + (index + 1) + "Text").innerHTML = singleDaysText
                        //reset the var
                        singleDaysText = ""
                    }
                    // console.log(data)
                })
                //catch bad city name queries
            } else {
                alert("bad query, try again")
            }
        })
}

//Clears the place I put recent searches, then populates it again
function populateRecentSearches(searches) {
    search.innerHTML = ""
    var div;
    //just loops through making an element and appending it.
    for (let index = 0; index < searches.length; index++) {
        const element = searches[index];
        div = document.createElement("div")
        div.innerHTML = element
        div.setAttribute("data-name", element)
        div.setAttribute("class", "searchBtn")
        search.appendChild(div)
    }
}

//simple switch, would be better as an if/else
//turns a word into an emoji
function figureEmoji(weather) {
    switch (weather) {
        case "Clear":
            return "☀️"
            break;
        case "Clouds":
            return "⛅"
            break;
        case "Rain":
            return "🌧️"
            break;
        case "Snow":
            return "🌨️"
            break;
        default:
            break;
    }
}

//color the uv index
function figureUVIColour(uvi) {
    if (uvi <= 2) {
        return "green";
    } else if (uvi <= 5) {
        //if it's hacky but it works...
        //the white on yellow just doesn't look good, this is quickest fix
        return "yellow; color: black";
    } else if (uvi <= 7) {
        return "orange";
    } else if (uvi <= 10) {
        return "red";
    }
}