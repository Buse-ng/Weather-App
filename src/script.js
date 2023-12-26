import { data } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const dateAndTime = document.getElementById("dateAndTime");
  const API_KEY = "48b780821f98aaec00763ade9ec87d3e";
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

  const degree = document.querySelector(".degree-1");
  const weatherDescription = document.querySelector(
    ".current-weather-description"
  );
  const KelvinToCelcius = (kelvin) => kelvin - 273.15;
  
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("form").reset();
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
          const cityName = data.city.name + ", " + data.city.country;
          document.getElementById("cityName").innerHTML = cityName;
          degree.innerHTML = KelvinToCelcius(data.list[0].main.temp).toFixed(0);
          weatherDescription.innerHTML =
            data.list[0].weather[0].description.toUpperCase();
          document.getElementById(
            "humidity"
          ).innerHTML = `Humidity: ${data.list[0].main.humidity}%`;
          document.getElementById(
            "windSpeed"
          ).innerHTML = `Wind: ${data.list[0].wind.speed}km/s`;
          // darkLightMode();
        });
    } else {
      console.log("sehir bulunamadi");
    }
  });

  function createCard(item) {
    const bottomCardsContainer = document.querySelector(".cards-highlights");
    bottomCardsContainer.innerHTML = "";
    
    const weatherData = {
      feels_like: `${KelvinToCelcius(item.main.feels_like).toFixed(0)} C`,
      humidity: item.main.humidity + "%",
      wind_speed: item.wind.speed.toFixed(2) + "km/s",
      visibility: item.visibility + "m",
    };

    const highlightKeys = Object.keys(weatherData);
    highlightKeys.forEach((key) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "w-1/2 p-4 bg-white rounded-lg shadow-md";
      
      const title = document.createElement("h2");
      title.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
      
      const icon = document.createElement("img");
      icon.src = "img/hot.png";
      icon.className = "w-12 h-12";
      
      const value = document.createElement("p");
      value.textContent = weatherData[key];

      cardDiv.appendChild(title);
      cardDiv.appendChild(icon);
      cardDiv.appendChild(value);

      bottomCardsContainer.appendChild(cardDiv);
    });
  }

  document.getElementById("todayBtn").addEventListener("click", ()=>{
      const listDtTxt = global_DATA.list[0].dt_txt.split(" ");
      const dayPart = listDtTxt[0]; // list date day part 2023-12-20
      const timePart = listDtTxt[1]; // list date time part 15:00:00
      console.log(timePart);
      const topCardsContainer = document.querySelector(".top-cards-container");
      topCardsContainer.innerHTML = '';
      // const bottomCardsContainer = document.querySelector(".cards-highlights");
      
      for (let item of global_DATA.list) {
        if (dayPart === item.dt_txt.split(" ")[0]) {
          console.log("Eşleşen bir tarih bulundu:", item.dt_txt);
    
          const card = document.createElement("div");
          card.className = "border border-2 p-6 bg-white rounded-xl";
    
          const timeHeader = document.createElement("h5");
          timeHeader.textContent = item.dt_txt.split(" ")[1];
    
          const img = document.createElement("img");
          img.src = "path-to-your-image.jpg";
    
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

  document.getElementById("weekBtn").addEventListener("click", ()=>{
      const topCardsContainer = document.querySelector(".top-cards-container");
      topCardsContainer.innerHTML = ''; 
      // const bottomCardsContainer = document.querySelector(".cards-highlights");
    
      const uniqueDates = new Set();
    
      for (let item of global_DATA.list) {
        const listDtTxt = item.dt_txt.split(" ")[0];
    
        if (!uniqueDates.has(listDtTxt)) {
          uniqueDates.add(listDtTxt); 
    
          const card = document.createElement("div");
          card.className = "border border-2 p-6 bg-white rounded-xl";
    
          const dayTitle = document.createElement('h5');
          const [year, month, day] = listDtTxt.split("-");
          const dateObj = new Date(year, month - 1, day);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          dayTitle.textContent = dayName;
    
          const img = document.createElement("img");
          img.src = "path-to-your-image.jpg";
    
          const tempParagraph = document.createElement("p");
          tempParagraph.textContent = `${KelvinToCelcius(item.main.temp).toFixed(0)}°C`;
    
          //For clicked card information
          card.addEventListener("click", function () {
            createCard(item);
          });
    
          card.appendChild(dayTitle);
          card.appendChild(img);
          card.appendChild(tempParagraph);
    
          topCardsContainer.appendChild(card);
        }
      }
  });
});