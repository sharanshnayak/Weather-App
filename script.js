const userWeatherTab=document.querySelector("[data-userWeather]");
const searchWeatherTab=document.querySelector("[data-searchWeather]");
const grantLocationSection=document.querySelector(".grant-location-container");
const grantLocationText=document.querySelector("[data-messageText]");
const grantLocationBtn=document.querySelector("[data-grantAccess]");
const citySearchFormSection=document.querySelector("[data-searchForm]");
const cityInput=document.querySelector("[data-searchInp]");
const citySearchBtn=document.querySelector("[data-searchBtn]");
const loader=document.querySelector("[data-loadingIcon]");
const weatherInfoSection=document.querySelector(".user-info-container");
const cityName=document.querySelector("[data-cityName]");
const countryFlag=document.querySelector("[data-countryIcon]");
const weatherDesc=document.querySelector("[data-weatherDesc]");
const weatherIcon=document.querySelector("[data-weatherIcon]");
const weatherTemp=document.querySelector("[data-temp]");
const cityWindSpeed=document.querySelector("[data-windspeed]");
const cityHumidity=document.querySelector("[data-humidity]");
const cityCloudiness=document.querySelector("[data-cloudiness]");
const apiErrorSection=document.querySelector(".api-error-container");
const apiErrorImg=document.querySelector("[data-notFoundImg]");
const apiErrorText=document.querySelector("[data-apiErrorText]");
const apiErrorBtn=document.querySelector("[data-apiErrorBtn]");


let currentTab=userWeatherTab;
let countryFlagApi="https://flagcdn.com/144x108/";
let weatherIconApi="https://openweathermap.org/img/w/";
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";


// `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
// `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;



currentTab.classList.add("current-tab");

searchWeatherTab.addEventListener('click', ()=>{
    apiErrorSection.classList.remove("active");
    if(currentTab==searchWeatherTab){
        return ;
    }
    else{
        currentTab.classList.remove("current-tab");
        weatherInfoSection.classList.remove("active");
    }

    currentTab=searchWeatherTab;
    currentTab.classList.add("current-tab");
    if(grantLocationSection.classList.contains("active"))grantLocationSection.classList.remove("active");
    citySearchFormSection.classList.add("active");

});


userWeatherTab.addEventListener('click', ()=>{
    apiErrorSection.classList.remove("active");
    if(currentTab==userWeatherTab){
        return ;
    }
    else{
        currentTab.classList.remove("current-tab");
        citySearchFormSection.classList.remove("active");
        weatherInfoSection.classList.remove("active");
    }

    currentTab=userWeatherTab;
    currentTab.classList.add("current-tab");
    getFromSessionStorage();

});


citySearchBtn.addEventListener('click', (e)=>{
    e.preventDefault();

    if (!cityInput.value || cityInput.value.trim() === "") {
        let text =  "Please enter a valid city name.";
        displayApiError(text,currentTab);
        return;
    }

    weatherInfoSection.classList.remove("active");
    fetchSearchedCityWeather(cityInput.value);
    
});


// Check if coordinates are already present in Session Storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
      grantLocationSection.classList.add("active");
    } else {
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeather(coordinates);
    }
  }
  
  // Get Coordinates using geoLocation
  // https://www.w3schools.com/html/html5_geolocation.asp
  function getLocation() {
    //console.log("getlocation...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      grantLocationBtn.style.display = "none";
      grantLocationText.innerText = "Geolocation is not supported by this browser.";
    }
  }
  
  // Store User Coordinates
  function showPosition(position) {
    const userCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    grantLocationSection.classList.remove("active");
    fetchUserWeather(userCoordinates);
  }
  
  // Handle any errors
  function showError(error) {
    //console.log("geolocation error",error);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        grantLocationText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        grantLocationText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        grantLocationText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        grantLocationText.innerText = "An unknown error occurred.";
        break;
    }
  }
  
  getFromSessionStorage();
  grantLocationBtn.addEventListener("click", getLocation);
  apiErrorBtn.addEventListener('click',getLocation);

async function fetchUserWeather(userCoordinates){
    const latitude=userCoordinates.latitude;
    const longitude=userCoordinates.longitude;
    try{
    apiErrorSection.classList.remove("active");
    loader.classList.add("active");
    const weather= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const weatherData=await weather.json();
    //console.log(weatherData);
    
    let apiCallCode=weatherData.cod;
    if(apiCallCode==200)fetchCityWeatherInfo(weatherData);
    else{
        let text =  "Unable to find Your City Weather";
        displayApiError(text,currentTab);
    }

    }
    catch(e){
        console.error("Error fetching weather data:", e);
        let text =  "Something went wrong while fetching weather data. Please try again.";
        displayApiError(text,currentTab);
    }
    finally{
        loader.classList.remove("active");
    }
}


async function fetchSearchedCityWeather(city){
    try{
    cityInput.value="";
    apiErrorSection.classList.remove("active");
    loader.classList.add("active");
    const weather= await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const weatherData=await weather.json();
    //console.log(weatherData);
    
    let apiCallCode=weatherData.cod;
    if(apiCallCode==200)fetchCityWeatherInfo(weatherData);
    else{
        let text = "Unable to find Searched City Weather";
        displayApiError(text,currentTab);
    }

    }
    catch(e){
        // console.error("Error fetching weather data:", e);
        let text = "Something went wrong while fetching weather data. Please try again.";
        displayApiError(text,currentTab);
    }
    finally{
        loader.classList.remove("active");
    }
}

function fetchCityWeatherInfo(weatherData) {
    let fetchedCityName=weatherData?.name;
    let fetchedCityCountryName=(weatherData?.sys?.country).toLowerCase();
    let fetchedWeatherDesc=weatherData?.weather?.[0]?.main;
    let fetchedWeatherIcon=weatherData?.weather?.[0].icon;
    let fetchedWeatherTemp=weatherData?.main?.temp;
    let fetchedCityWindSpeed=weatherData?.wind?.speed;
    let fetchedCityHumidity=weatherData?.main?.humidity;
    let fetchedCityCloudiness=weatherData?.clouds?.all;

    //console.log(fetchedCityName);
    //console.log(fetchedCityCountryName);
    //console.log(fetchedWeatherDesc);
    //console.log(fetchedWeatherIcon);
    //console.log(fetchedWeatherTemp);
    //console.log(fetchedCityWindSpeed);
    //console.log(fetchedCityHumidity);
    //console.log(fetchedCityCloudiness);

    displayWeatherInfo(fetchedCityName,fetchedCityCountryName,fetchedWeatherDesc,fetchedWeatherIcon,fetchedWeatherTemp,fetchedCityWindSpeed,fetchedCityHumidity,fetchedCityCloudiness);

}


function displayWeatherInfo(city, cityCountryName, desc, icon, temp, windSpeed, humidity, cloudiness){
    // //console.log("displaying..");
    
    cityName.innerText=city;
    country=countryFlagApi+cityCountryName+".png";
    countryFlag.src=country;
    weatherDesc.innerText=desc;
    weatherIcon.src=weatherIconApi+icon+".png";
    weatherTemp.innerText=temp+" °C";
    cityWindSpeed.innerText=windSpeed;
    cityHumidity.innerText=humidity+"%";
    cityCloudiness.innerText=cloudiness+"%";

    weatherInfoSection.classList.add("active");

}

function displayApiError(text,currentTab){
    apiErrorText.innerText=text;
    if(currentTab==searchWeatherTab)apiErrorBtn.style.display="none";
    apiErrorSection.classList.add("active");
}