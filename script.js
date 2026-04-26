const btn = document.getElementById("weather-btn");
const results = document.getElementById("results");
const userInput = document.getElementById("userInput");
const weatherType = document.getElementById("weatherType");
const suggestions = document.getElementById("suggestions");

let selectedIndex = -1;
let suggestionsList = [];

let timeout;
const debounce = (func, delay) => {
  clearTimeout(timeout);
  timeout = setTimeout(func, delay);
};

const getWeather = async () => {
  try {
    btn.disabled = true;
    btn.innerText = "Loading...";

    let city = userInput.value.trim();

    if (!city) {
      results.textContent = "Enter city name!";
      weatherType.textContent = "";
      return;
    }

    city = city.split(",")[0];

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      results.textContent = "City not found!";
      weatherType.textContent = "";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const temp = weatherData.current_weather.temperature;

    if (temp >= 30) {
      weatherType.textContent = "🔥 Hot";
    } else if (temp >= 20) {
      weatherType.textContent = "🌤 Normal";
    } else {
      weatherType.textContent = "❄ Cold";
    }

    results.textContent = `${name}, ${country} → ${temp}°C`;

  } catch {
    results.textContent = "Error!";
    weatherType.textContent = "";
  } finally {
    btn.disabled = false;
    btn.innerText = "Search";
  }
};


userInput.addEventListener("input", () => {
  debounce(async () => {
    const city = userInput.value.trim();

    if (city.length < 2) {
      suggestions.style.display = "none";
      return;
    }

    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const data = await res.json();

    suggestions.innerHTML = "";
    selectedIndex = -1;

    if (data.results && data.results.length > 0) {
      suggestionsList = data.results.slice(0, 5);
      suggestions.style.display = "block";

      suggestionsList.forEach((place, index) => {
        const li = document.createElement("li");
        li.textContent = `${place.name}, ${place.country}`;

        li.onclick = () => selectCity(index);

        suggestions.appendChild(li);
      });
    } else {
      suggestions.style.display = "none";
    }
  }, 400);
});


const selectCity = (index) => {
  const place = suggestionsList[index];

  userInput.value = `${place.name}, ${place.country}`;
  suggestions.style.display = "none";
  suggestions.innerHTML = "";

  getWeather();
};


userInput.addEventListener("keydown", (e) => {
  const items = suggestions.querySelectorAll("li");

  if (!items.length) return;

  if (e.key === "ArrowDown") {
    selectedIndex = (selectedIndex + 1) % items.length;
  }

  if (e.key === "ArrowUp") {
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
  }

  if (e.key === "Enter") {
    e.preventDefault();

    if (selectedIndex >= 0) {
      selectCity(selectedIndex);
    } else {
      getWeather();
    }
  }

  items.forEach((item, i) => {
    item.classList.toggle("active", i === selectedIndex);
  });
});


btn.onclick = () => {
  suggestions.style.display = "none";
  getWeather();
};

document.addEventListener("click", (e) => {
  if (!userInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = "none";
  }
});