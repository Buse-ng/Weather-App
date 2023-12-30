import { data } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestionsContainer = document.getElementById("suggestions-container"); //!
  const searchButton = document.getElementById("searchButton");
  const dateAndTime = document.getElementById("dateAndTime");
  const API_KEY = "";
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
          degree.innerHTML = KelvinToCelcius(data.list[0].main.temp).toFixed(0);
          weatherDescription.innerHTML =
            data.list[0].weather[0].description.toUpperCase();
          document.getElementById("feelsLike").innerHTML = 
            `Feels Like: ${KelvinToCelcius(data.list[0].main.feels_like).toFixed(0)}`;
          document.getElementById("windSpeed").innerHTML = 
            `Wind Speed: ${data.list[0].wind.speed}km/s`;
          // darkLightMode();
        });
    } else {
      console.log("sehir bulunamadi");
    }
  });
  

  // Highlights cards
  function createCard(item) {
    const bottomCardsContainer = document.querySelector(".cards-highlights");
    bottomCardsContainer.innerHTML = "";

    const weatherData = {
      humidity: [`${item.main.humidity} %`, "fa-solid fa-droplet"],
      wind_speed: [`${item.wind.speed.toFixed(2)} km/s`,"fa-solid fa-wind"],
      visibility: [`${item.visibility} m`, "fa-solid fa-eye"],
      // pop: [item.pop, "fa-solid fa-cloud-rain"],//probability of precipitation
      clouds: [`${item.clouds.all} %`, "fa-solid fa-cloud"], // clouds %:  all:1 100%, all:0 0% 
      // sunrise: [item.sunrise, "fa-regular fa-sun"],
      // sunset: [item.sunset, "fa-solid fa-sun"],
      // snow: [item.snow, "fa-solid fa-snowflake"], // 3h: snow amount in the last 3 hours
      // rain: [item.rain, "fa-solid fa-cloud-showers-heavy"], // 3h: rain amount in the last 3 hours
    };

    const highlightKeys = Object.keys(weatherData);

    highlightKeys.forEach((key) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "p-2 md:p-6 bg-white rounded-lg shadow-md"; //w-1/2
      
      const title = document.createElement("h2");
      // title.className="flex flex-wrap";
      title.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ");
      
      const icon = document.createElement("i");
      icon.className = weatherData[key][1];
      // icon.className = "w-12 h-12";
      
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
      // const timePart = listDtTxt[1]; // list date time part 15:00:00
      // console.log(timePart);
      const topCardsContainer = document.querySelector(".top-cards-container");
      topCardsContainer.innerHTML = '';

      for (let item of global_DATA.list) {
        if (dayPart === item.dt_txt.split(" ")[0]) {
          console.log("Eşleşen bir tarih bulundu:", item.dt_txt);
    
          const card = document.createElement("div");
          card.className = "border border-2 py-4 px-8 md:p-6 bg-white rounded-xl";
    
          const timeHeader = document.createElement("h5");
          timeHeader.textContent = (item.dt_txt.split(" ")[1]).split(":").slice(0, 2).join(":");
    
          const img = document.createElement("img");
          img.src =`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
          //@2x olma sebebi 2 kat daha yuksek cozunurluk sunması icin.
          // console.log(img);

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
          card.className = "border border-2 py-4 px-8 md:p-6 bg-white rounded-xl";
          
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
