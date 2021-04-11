$(document).ready(function(){

  var cityStorage = localStorage;
  var cityList= [];
  const APIKEY = "266d9fdb2f0cc041d628e42517ec5086";
  var targetCity = "";
  var targetCityLon = "";
  var targetCityLat = "";
  
  function retrievePastSearches(){
      if (cityStorage.getItem("searchHistory") != undefined){
          cityList = JSON.parse(cityStorage.getItem("searchHistory"));
          for (var i = 0; i < cityList.length; i++){
              var newRecentSearchLink = $("<a href=\"\#\"></a>");
              newRecentSearchLink.text(cityList[i]);
              newRecentSearchLink.attr("data-city",cityList[i]);
              newRecentSearchLink.attr("class","recentSearchItem list-group-item list-group-item-action");
              $("#resultList").prepend(newRecentSearchLink);
          }
      }
  }

  retrievePastSearches();

  
  function savePastSearches(){
      cityStorage.setItem("searchHistory", JSON.stringify(cityList));
  }
  
  
  $("#searchButton").on("click",function(){
      event.preventDefault();
      console.log(`Searching for ${$("#searchTermEntry").val()} data.`);
      targetCity = $("#searchTermEntry").val();
      
      getCurrentWeatherData(targetCity);        
  });

  
  function getCurrentWeatherData(cityName){
      $.ajax({
          method: "GET",
          url: "https://api.openweathermap.org/data/2.5/weather?q=" + `${cityName}&appid=${APIKEY}&units=imperial`,        
      })
        .then(function(currentResponse){
          console.log(currentResponse);
          var alreadyInList = false;
          for (var a = 0; a < $("#resultList").children().length; a++){
              var existingEntry = $("#resultList").children().get(a).textContent;
              if (existingEntry === cityName){
                  console.log(`${existingEntry} already in list.`);
                  alreadyInList = true;
              }
          }

          if (alreadyInList === false){
              var newRecentSearchLink = $("<a href=\"\#\"></a>");
              newRecentSearchLink.text(cityName);
              newRecentSearchLink.attr("data-city",cityName);
              newRecentSearchLink.attr("class","recentSearchItem list-group-item list-group-item-action");
              $("#resultList").prepend(newRecentSearchLink);
          
              cityList.push(cityName);
              savePastSearches();
          }

          $("#currentWeatherCity").text(currentResponse.name);
          $("#currentWeatherIcon").attr("src", `https://openweathermap.org/img/wn/${currentResponse.weather[0].icon}@2x.png`);
          $("#currentTempSpan").html(`${currentResponse.main.temp} &deg;F`);
          $("#currentHumiditySpan").text(`${currentResponse.main.humidity}%`);
          $("#currentWindSpan").text(`${currentResponse.wind.speed} mph`);

          targetCityLon = currentResponse.coord.lon;
          targetCityLat = currentResponse.coord.lat;

          getUVIndex(targetCityLat,targetCityLon);

          getFiveDayForecast(targetCityLat, targetCityLon);
      });
  }

  function getUVIndex(latitude, longitude){
      $.ajax({
          method: "GET",
          url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + `${APIKEY}&lat=${latitude}&lon=${longitude}`
      })
        .then(function(UVresponse){
          $("#currentUVSpan").text(UVresponse.value);
          var UVunit = parseInt(UVresponse.value);

          if (UVunit <= 2){
              // Low Index
              $("#currentUVSpan").css("background-color", "#97D700");
              $("#currentUVSpan").css("color", "#000000");
          } else if (UVunit >= 3 && UVunit <= 5 ){
              // Moderate Index
              $("#currentUVSpan").css("background-color", "#FCE300");
              $("#currentUVSpan").css("color", "#000000");
          } else if (UVunit >= 6 && UVunit <= 7){
              // High Index
              $("#currentUVSpan").css("background-color", "#FF8200");
              $("#currentUVSpan").css("color", "#FFFFFF");
          } else if (UVunit >= 8 && UVunit <= 10){
              // Very High Index
              $("#currentUVSpan").css("background-color", "#EF3340");
              $("#currentUVSpan").css("color", "#FFFFFF");
          } else if (UVunit >= 11){
              // Extreme Index
              $("#currentUVSpan").css("background-color", "#9063CD");
              $("#currentUVSpan").css("color", "#FFFFFF");
          }

          var currentDataDate = moment(UVresponse.date_iso);
          $("#currentWeatherDate").text(currentDataDate.format("M/DD/YYYY"));         
      });
  }

  function getFiveDayForecast(latitude, longitude){
      $("#fiveDayCardsRow").empty();

      $.ajax({
          method: "GET",
          url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&appid=${APIKEY}&units=imperial`,
      }).then(function(fiveDayResponse){
          console.log(fiveDayResponse);
          var  fiveDayForecastList = fiveDayResponse.daily;
          for (var l = 1; l < 6; l++) {
            var dailyDate = moment(fiveDayForecastList[l].dt,"X");
            var fiveDayCardDateTxt = dailyDate.format("M/DD/YYYY");
            var fiveDayCardIconSrc = `https://openweathermap.org/img/wn/${fiveDayForecastList[l].weather[0].icon}@2x.png`;
            var fiveDayCardTempTxt = `Temp: ${fiveDayForecastList[l].temp.day} °F`;
            var fiveDayCardHumidTxt = `Humidity: ${fiveDayForecastList[l].humidity}%`;

            var newFiveDayCard = document.createElement("div");
            $(newFiveDayCard).attr("class", "fiveDayCard card m-3");
            $("#fiveDayCardsRow").append(newFiveDayCard);
            var newFiveDayCardBody = $("<div>");
            $(newFiveDayCard).append(newFiveDayCardBody);
            $(newFiveDayCardBody).attr("class", "card-body");
            
            var newFiveDayCardHeading = document.createElement("h4");
            $(newFiveDayCardHeading).attr("class", "card-title fiveDayDate");
            $(newFiveDayCardHeading).text(fiveDayCardDateTxt);
            $(newFiveDayCardBody).append(newFiveDayCardHeading);
            
            var newFiveDayCardIcon = document.createElement("img");
            $(newFiveDayCardIcon).attr("src", fiveDayCardIconSrc);
            $(newFiveDayCardBody).append(newFiveDayCardIcon);
            
            var newFiveDayCardTemp = document.createElement("p");
            $(newFiveDayCardTemp).text(fiveDayCardTempTxt);
            $(newFiveDayCardBody).append(newFiveDayCardTemp);

            var newFiveDayCardHumidity = document.createElement("p");
            $(newFiveDayCardHumidity).text(fiveDayCardHumidTxt);
            $(newFiveDayCardBody).append(newFiveDayCardHumidity);
          }
      });
  }

  $(".recentSearchItem").click(function(){
      event.preventDefault;
      console.log(`Clicked on ${this.dataset.city}.`);
      getCurrentWeatherData(this.dataset.city);
  });

});


