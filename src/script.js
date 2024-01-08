// require('dotenv').config();
import { data } from "./data.js";
import { API_KEY } from "./env.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestionsContainer = document.getElementById("suggestions-container"); //!
  const searchButton = document.getElementById("searchButton");
  const dateAndTime = document.getElementById("dateAndTime");
  // const API_KEY =
  const highlightsTitle=document.querySelector('.highlights-title');
  let global_DATA;
  
  function getFormattedDate(date) {
    const options = {
      weekday: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  function updateDateTime() {
    dateAndTime.innerHTML = getFormattedDate(new Date());
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  const degree = document.querySelector(".degree");
  const weatherDescription = document.querySelector(
    ".current-weather-description"
  );
  const KelvinToCelcius = (kelvin) => kelvin - 273.15;
  
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("form").reset();
  });

  function autocomplete(input){
    const inputValue=input.value.toLowerCase();
    
    if (!inputValue || inputValue.length < 1) {
      suggestionsContainer.innerHTML = '';
      return;
    }
    
    const suggestions = data.filter(city => city.city.toLowerCase().startsWith(inputValue));

    suggestionsContainer.innerHTML = "";
    
    const autocompleteList = document.createElement("div");
    autocompleteList.className="mt-1 bg-white rounded-md shadow-lg max-h-48 overflow-y-auto";
    autocompleteList.id = "autocomplete-list";
    suggestionsContainer.appendChild(autocompleteList);

    suggestions.forEach(suggestion => {
      const suggestionsDiv=document.createElement("div");
      suggestionsDiv.textContent= suggestion.city;
      suggestionsDiv.className = "p-2 hover:bg-gray-200 cursor-pointer";

      suggestionsDiv.addEventListener("click", () => {
        searchInput.value=suggestion.city;
        autocompleteList.innerHTML="";
      });
      autocompleteList.appendChild(suggestionsDiv);
    });
    document.addEventListener('click', function(e) {
      if (!autocompleteList.contains(e.target) && e.target !== searchInput) {
        autocompleteList.innerHTML = '';  
      }
    });

    if (suggestions.length === 0) {
      const noResultDiv = document.createElement('div');
      noResultDiv.textContent = "No matches found.";
      noResultDiv.className = "p-2 text-gray-500";
      autocompleteList.appendChild(noResultDiv); 
    }
  }
  searchInput.addEventListener('input', function() {
    autocomplete(this);
  });

  searchButton.addEventListener("click", () => {
    const searchInputValue = searchInput.value.toLowerCase();

    const cityData = data.find(
      (city) => city.city.toLowerCase() === searchInputValue
    );
      
    if (cityData) {
      const latitude = Number(cityData.lat).toFixed(2);
      const longitude = Number(cityData.lng).toFixed(2);
      const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

      fetch(API_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error, response not ok");
          }
          return response.json();
        })
        .then((data) => {
          global_DATA = data;
          
          console.log(global_DATA);
          const mainImg=document.getElementById("imgMain"); 
          mainImg.src=`https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;
          const cityName = data.city.name + ", " + data.city.country;
          document.getElementById("cityName").innerHTML = cityName;
          degree.innerHTML = `${KelvinToCelcius(data.list[0].main.temp).toFixed(0)}°C`;
          weatherDescription.innerHTML =
            data.list[0].weather[0].description.toUpperCase();
          document.querySelector(".feelsLike").innerHTML = 
            `Feels Like: ${KelvinToCelcius(data.list[0].main.feels_like).toFixed(0)}°C`;
          document.querySelector(".windSpeed").innerHTML = 
            `Wind Speed: ${data.list[0].wind.speed}km/s`;
          // darkLightMode();
        });
    } else {
      console.log("sehir bulunamadi");
    }
  });
  
  // for sunset and sunrise
  function getTimeConverter(unixTimestamp) {
    const dateObject = new Date(unixTimestamp * 1000);
    return dateObject.toLocaleTimeString().split(":").slice(0, 2).join(":");
  }

  // Highlights cards
  function createCard(item) {
    const bottomCardsContainer = document.querySelector(".cards-highlights");
    bottomCardsContainer.innerHTML = "";

    const weatherData = {
      sunrise: [`${getTimeConverter(global_DATA.city.sunrise)}`, "fa-regular fa-sun"],
      sunset: [`${getTimeConverter(global_DATA.city.sunset)}`, "fa-solid fa-sun"],
      humidity: [`${item.main.humidity} %`, "fa-solid fa-droplet"],
      wind_speed: [`${item.wind.speed.toFixed(2)} km/s`,"fa-solid fa-wind"],
      visibility: [`${item.visibility} m`, "fa-solid fa-eye"],
      pop: [`${item.pop} %`, "fa-solid fa-cloud-rain"],//probability of precipitation
      clouds: [`${item.clouds.all} %`, "fa-solid fa-cloud"], 
    };

    // 3h: rain-snow amount in the last 3 hours
    if(item.snow && item.snow["3h"]){
      weatherData.snow=[`${item.snow["3h"]} mm (3h)`, "fa-solid fa-snowflake"];
    }
    if(item.rain && item.rain["3h"]){
      weatherData.rain=[`${item.rain["3h"]} mm (3h)`, "fa-solid fa-cloud-showers-heavy"];
    }

    const highlightKeys = Object.keys(weatherData);

    highlightKeys.forEach((key) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "py-8 text-center bg-gray-200 rounded-lg shadow-md w-36 h-36 overflow-auto";
      
      const title = document.createElement("h2");
      title.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
      
      const icon = document.createElement("i");
      icon.className = weatherData[key][1];

      const valueData = document.createElement("p");
      valueData.textContent = weatherData[key][0];

      cardDiv.appendChild(title);
      cardDiv.appendChild(icon);
      cardDiv.appendChild(valueData);

      bottomCardsContainer.appendChild(cardDiv);
    });
  }

  //today
  document.getElementById("todayBtn").addEventListener("click", ()=>{
      highlightsTitle.innerHTML = `Today's Highlights`;
      
      const listDtTxt = global_DATA.list[0].dt_txt.split(" ");
      const dayPart = listDtTxt[0]; // list date day part 2023-12-20

      const topCardsContainer = document.querySelector(".top-cards-container");
      topCardsContainer.innerHTML = '';

      for (let item of global_DATA.list) {
        if (dayPart === item.dt_txt.split(" ")[0]) {
          console.log("Eşleşen bir tarih bulundu:", item.dt_txt);
    
          const card = document.createElement("div");
          card.className = "border border-2 py-2 px-4 bg-gray-300 rounded-xl";
    
          const timeHeader = document.createElement("h5");
          timeHeader.textContent = (item.dt_txt.split(" ")[1]).split(":").slice(0, 2).join(":");
    
          const img = document.createElement("img");
          img.src =`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
          //@2x is to provide twice the resolution.

          const tempParagraph = document.createElement("p");
          tempParagraph.textContent = `${KelvinToCelcius(item.main.temp).toFixed(0)}°C`;
    
          //For clicked card information
          card.addEventListener("click", function () {
            createCard(item);
          });
          card.appendChild(timeHeader);
          card.appendChild(img);
          card.appendChild(tempParagraph);
    
          topCardsContainer.appendChild(card);
        }
      }
  });

  //week 
  document.getElementById("weekBtn").addEventListener("click", ()=>{
      highlightsTitle.innerHTML="";
      const topCardsContainer = document.querySelector(".top-cards-container");
      topCardsContainer.innerHTML = ''; 
    
      const uniqueDates = new Set();
    
      for (let item of global_DATA.list) {
        const listDtTxt = item.dt_txt.split(" ")[0];
    
        if (!uniqueDates.has(listDtTxt)) {
          uniqueDates.add(listDtTxt); 
    
          const card = document.createElement("div");
          card.className = "border border-2 py-2 px-4 bg-gray-300 rounded-xl";
          
          const dayTitle = document.createElement('h5');
          const [year, month, day] = listDtTxt.split("-");
          const dateObj = new Date(year, month - 1, day);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          dayTitle.textContent = dayName;
    
          const img = document.createElement("img");
          img.src =`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    
          const tempParagraph = document.createElement("p");
          tempParagraph.textContent = `${KelvinToCelcius(item.main.temp).toFixed(0)}°C`;
    
          //For clicked card information
          card.addEventListener("click", function () {
            createCard(item);
            highlightsTitle.innerHTML = `${dayName}'s Highlights`;
          });
    
          card.appendChild(dayTitle);
          card.appendChild(img);
          card.appendChild(tempParagraph);
    
          topCardsContainer.appendChild(card);
        }
      }
  });
});
