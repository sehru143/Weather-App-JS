
const btn = document.getElementById("weather-btn");
const results = document.getElementById("results");
const userInput = document.getElementById("userInput");
const weatherType = document.getElementById("weatherType");

const getWeather = async () => {
  try {
    btn.disabled = true;
    btn.innerText = "Loading...";
    const city = userInput.value.trim();
    if (!city) {      //
      results.innerText = "Please Enter City name first!";
      return;
    }
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`,
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      results.textContent = "City not found!";
      return;
    }

    const lat = geoData.results[0].latitude;
    const lon = geoData.results[0].longitude;

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
    );
    const weatherData = await weatherRes.json();
    const temp = weatherData.current_weather.temperature;
   
      if(temp >= 26){
        weatherType.textContent = "Hot Temperature!";
      }else   if(temp >= 11){
        weatherType.textContent = "Normal Temperature!";
      }else   if(temp <= 10){
        weatherType.textContent = "Cold Temperature!";
      }
   
    if (!weatherData.current_weather) {
      results.textContent = "Weather data unavailable";
    }

    const text = temp + "°C";
    results.textContent = "Temperature: " + text;
  } catch (err) {
    console.log(err);
    results.textContent = "Network Error. Try Again!";
  } finally {
    btn.disabled = false;
    btn.innerText = "Get Weather";
  }
};

btn.addEventListener("click", getWeather);
