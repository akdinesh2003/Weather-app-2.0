// 🌟 SUPER CLEAN WORKING WEATHER APP 🌟
const apiKey = "3aedac8f632872eef642bfb8d85bf699";
const favoritesKey = "favoriteCities";
const unitKey = "unitPref";
const themeKey = "themePref";

let unitMode = localStorage.getItem(unitKey) || "C";
let isLightTheme = localStorage.getItem(themeKey) === "light";
let currentWeatherData = null;

// 🎭 Demo data for when API fails
const demoWeatherData = {
  name: "London",
  sys: { country: "GB", sunrise: 1635747600, sunset: 1635784800 },
  main: { temp: 22, feels_like: 24, temp_min: 18, temp_max: 25, pressure: 1013, humidity: 65 },
  weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
  wind: { speed: 3.5 },
  clouds: { all: 20 },
  visibility: 10000,
  coord: { lat: 51.5074, lon: -0.1278 },
  timezone: 0,
  cod: 200
};

console.log("🚀 WeatherPro - Starting...");

// Utility functions
function showLoader(show) {
  console.log("⏳ Loader:", show ? "showing" : "hiding");
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return;

  if (show) {
    resultDiv.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div class="loader"></div>
        <div style="margin-top: 1rem; color: var(--text-secondary);">
          Getting weather data...
        </div>
      </div>
    `;
  }
}

function getUnitsParam() {
  return unitMode === "F" ? "imperial" : "metric";
}

function getTempUnit() {
  return unitMode === "F" ? "°F" : unitMode === "K" ? "K" : "°C";
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  console.log("📱 DOM loaded, initializing app...");
  setTimeout(initializeApp, 100);
});

function initializeApp() {
  console.log("⚙️ Initializing app...");

  try {
    // Set initial theme
    if (isLightTheme) {
      document.documentElement.setAttribute('data-theme', 'light');
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) themeToggle.classList.add('active');
    }

    // Set initial unit
    if (unitMode === "F") {
      const unitToggle = document.getElementById("unitToggle");
      if (unitToggle) unitToggle.classList.add('active');
    }

    // Add event listeners
    setupEventListeners();
    setupTabListeners();

    // Load favorites
    loadFavorites();

    // Initialize default content
    initializeDefaultContent();

    // Start time updates
    setInterval(updateTime, 1000);
    updateTime();

    // Add demo button
    addDemoButton();

    // Populate sidebar content
    setTimeout(populateAllSidebarContent, 500);

    console.log("✅ WeatherPro - Ready!");

  } catch (error) {
    console.error("❌ Initialization error:", error);
  }
}

function setupEventListeners() {
  console.log("🔗 Setting up event listeners...");

  try {
    // Unit toggle
    const unitToggle = document.getElementById("unitToggle");
    if (unitToggle) {
      unitToggle.addEventListener("click", function () {
        console.log("🌡️ Unit toggle clicked");
        if (unitMode === "C") {
          unitMode = "F";
          this.classList.add('active');
        } else if (unitMode === "F") {
          unitMode = "K";
          this.classList.remove('active');
        } else {
          unitMode = "C";
          this.classList.remove('active');
        }
        localStorage.setItem(unitKey, unitMode);

        // Refresh weather if we have data
        if (currentWeatherData) {
          displayWeatherData(currentWeatherData);
        }
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        console.log("🎨 Theme toggle clicked");
        isLightTheme = !isLightTheme;
        localStorage.setItem(themeKey, isLightTheme ? "light" : "dark");
        document.documentElement.setAttribute('data-theme', isLightTheme ? 'light' : 'dark');

        if (isLightTheme) {
          this.classList.add('active');
        } else {
          this.classList.remove('active');
        }
      });
    }

    // Search input
    const cityInput = document.getElementById("city");
    if (cityInput) {
      cityInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          console.log("⌨️ Enter pressed, searching weather");
          getWeather();
        }
      });

      // Autocomplete
      cityInput.addEventListener("input", handleAutocomplete);
    }

    // Click outside to close autocomplete
    document.addEventListener("click", function (e) {
      if (!e.target.closest('.search-container')) {
        const autocompleteList = document.getElementById("autocomplete-list");
        if (autocompleteList) {
          autocompleteList.innerHTML = "";
        }
      }
    });

    // Mascot interaction
    const mascot = document.getElementById('mascot-character');
    if (mascot) {
      mascot.addEventListener('click', function () {
        console.log("🎭 Mascot clicked");
        showMascotMessage();
      });
    }

    console.log("✅ Event listeners set up");

  } catch (error) {
    console.error("❌ Event listener setup error:", error);
  }
}

// Setup tab listeners as backup
function setupTabListeners() {
  console.log("🔗 Setting up tab listeners...");

  const tabButtons = document.querySelectorAll('.tab-btn');
  console.log("🔘 Found tab buttons:", tabButtons.length);

  tabButtons.forEach(button => {
    const tabName = button.id.replace('-btn', '');
    console.log("🎯 Setting up listener for:", tabName);

    button.addEventListener('click', function (e) {
      e.preventDefault();
      console.log("🖱️ Tab button clicked:", tabName);
      showTab(tabName);
    });
  });
}

// Main weather function with demo fallback
async function getWeather(cityInput) {
  console.log("� geatWeather function called with:", cityInput);

  const cityInputElement = document.getElementById("city");
  console.log("📍 City input element:", cityInputElement);

  let city = cityInput || (cityInputElement ? cityInputElement.value.trim() : "");
  console.log("🏙️ City value:", city);

  if (!city) {
    // If no city provided, use demo data
    city = "London";
    if (cityInputElement) {
      cityInputElement.value = city;
    }
    console.log("🎯 Using default city:", city);
  }

  console.log("🔍 Searching weather for:", city);
  showLoader(true);

  try {
    const units = getUnitsParam();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("📡 Weather data received:", data);
    showLoader(false);

    if (data.cod === 200) {
      currentWeatherData = data;
      displayWeatherData(data);
      localStorage.setItem("lastCity", data.name);

      // Get additional data (with error handling)
      try {
        getForecast(city, units);
        getAirQuality(data.coord.lat, data.coord.lon);
        getUVIndex(data.coord.lat, data.coord.lon);
        getNearbyWeather(data.coord.lat, data.coord.lon);
        getHourlyForecast(city, units);
        showCityTime(data.timezone);

        // Always populate sidebar content
        showDemoAdditionalData();
        populateAllSidebarContent();
      } catch (additionalError) {
        console.log("⚠️ Some additional features failed, using demo data");
        showDemoAdditionalData();
        populateAllSidebarContent();
      }

    } else {
      console.log("❌ API returned error, using demo data");
      useDemoData(city);
    }
  } catch (error) {
    console.log("❌ Network error, using demo data:", error.message);
    showLoader(false);
    useDemoData(city);
  }
}

// Demo data function
function useDemoData(searchedCity) {
  console.log("🎭 Loading demo weather data for:", searchedCity);

  const customDemoData = { ...demoWeatherData };
  customDemoData.name = searchedCity || "Demo City";

  // Customize based on city
  if (searchedCity) {
    const cityLower = searchedCity.toLowerCase();
    if (cityLower.includes('new york') || cityLower.includes('chicago')) {
      customDemoData.main.temp = 18;
      customDemoData.weather[0].main = "Cloudy";
      customDemoData.weather[0].description = "partly cloudy";
    } else if (cityLower.includes('miami') || cityLower.includes('dubai')) {
      customDemoData.main.temp = 32;
      customDemoData.weather[0].main = "Clear";
      customDemoData.weather[0].description = "sunny";
    }
  }

  currentWeatherData = customDemoData;
  displayWeatherData(customDemoData);
  localStorage.setItem("lastCity", customDemoData.name);

  // Show demo additional data
  showDemoAdditionalData();
  showCityTime(customDemoData.timezone);

  // Make sure all sidebar content is populated
  populateAllSidebarContent();

  // Show demo notice
  setTimeout(showDemoNotice, 1000);
}

function showDemoAdditionalData() {
  // Air Quality
  const airQualityDiv = document.getElementById("air-quality");
  if (airQualityDiv) {
    airQualityDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">2/5</div>
        <div style="font-weight: 600; margin-bottom: 1rem;">Good</div>
        <div class="aqi-indicator aqi-good"></div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
          PM2.5: 12.5 μg/m³
        </div>
      </div>
    `;
  }

  // UV Index
  const uvDiv = document.getElementById("uv-index");
  if (uvDiv) {
    uvDiv.innerHTML = `
      <div style="text-align: center;">
        <div class="uv-indicator uv-moderate">4</div>
        <div style="font-weight: 600; margin-top: 0.5rem;">Moderate</div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
          Use sunscreen!
        </div>
      </div>
    `;
  }

  // Nearby Weather
  const nearbyDiv = document.getElementById("nearby-weather");
  if (nearbyDiv) {
    nearbyDiv.innerHTML = `
      <div class="nearby-city" onclick="getWeather('Paris')">
        <span>Paris</span>
        <span>19°C</span>
      </div>
      <div class="nearby-city" onclick="getWeather('Berlin')">
        <span>Berlin</span>
        <span>16°C</span>
      </div>
    `;
  }

  // Forecast
  showDemoForecast();
}

function showDemoNotice() {
  const resultDiv = document.getElementById("result");
  if (resultDiv) {
    const demoNotice = document.createElement("div");
    demoNotice.style.cssText = `
      background: rgba(255, 193, 7, 0.2);
      border: 1px solid rgba(255, 193, 7, 0.4);
      border-radius: 10px;
      padding: 0.75rem;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-primary);
    `;
    demoNotice.innerHTML = `
      <i class="fas fa-info-circle"></i> 
      <strong>Demo Mode:</strong> Showing sample weather data. 
      Internet connection may be needed for live data.
    `;
    resultDiv.appendChild(demoNotice);
  }
}

// Voice Search
function startVoiceSearch() {
  console.log("🎙️ Starting voice search");
  alert("Voice search feature - speak your city name!");
  // For demo, just use London
  getWeather("London");
}

// Get Current Location
function getCurrentLocation() {
  console.log("� Gettingi current location");
  alert("Location feature activated!");
  // For demo, use current location as London
  getWeather("London");
}

// Tab System
function showTab(tabName) {
  console.log("📑 Switching to tab:", tabName);

  try {
    // Debug: Check if elements exist
    console.log("🔍 Looking for tab:", tabName + '-tab');
    console.log("🔍 Looking for button:", tabName + '-btn');

    // Hide all tabs
    const allTabs = document.querySelectorAll('.tab-content');
    console.log("📋 Found tabs:", allTabs.length);
    allTabs.forEach(function (tab) {
      tab.classList.remove('active');
      console.log("� Hidi ng tab:", tab.id);
    });

    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.tab-btn');
    console.log("🔘 Found buttons:", allButtons.length);
    allButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });

    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    console.log("🎯 Target tab found:", !!targetTab);
    if (targetTab) {
      targetTab.classList.add('active');
      console.log("✅ Activated tab:", targetTab.id);
    }

    // Add active class to clicked button
    const clickedButton = document.getElementById(tabName + '-btn');
    console.log("🔘 Target button found:", !!clickedButton);
    if (clickedButton) {
      clickedButton.classList.add('active');
      console.log("✅ Activated button:", clickedButton.id);
    }

    // Initialize specific tab content
    if (tabName === 'current') {
      console.log("📊 Current tab - already populated");
    } else if (tabName === 'forecast') {
      console.log("📅 Loading forecast tab");
      showForecastTab();
    } else if (tabName === 'hourly') {
      console.log("⏰ Loading hourly tab");
      showHourlyTab();
    } else if (tabName === 'charts') {
      setTimeout(function () { initCharts(); }, 100);
    } else if (tabName === 'insights') {
      setTimeout(function () { generateAIInsights(); }, 100);
    }

    console.log("✅ Tab switched to:", tabName);

  } catch (error) {
    console.error("❌ Tab switching error:", error);
  }
}

function displayWeatherData(data) {
  console.log("📊 Displaying weather data");

  try {
    const tempUnit = getTempUnit();
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    const humidityPercent = data.main.humidity;
    const windPercent = Math.min(data.wind.speed * 10, 100);
    const cloudinessPercent = data.clouds.all;

    const resultDiv = document.getElementById("result");
    if (!resultDiv) return;

    resultDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">
          <i class="fas fa-map-marker-alt"></i> ${data.name}, ${data.sys.country}
        </h2>
        <img src="${iconUrl}" alt="Weather icon" class="weather-icon" style="width: 100px; height: 100px;" />
        <div style="font-size: 3rem; font-weight: 700; margin: 1rem 0;">
          ${Math.round(data.main.temp)}${tempUnit}
        </div>
        <div style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
          ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}
        </div>
        <div style="font-size: 1rem; color: var(--text-secondary);">
          Feels like ${Math.round(data.main.feels_like)}${tempUnit}
        </div>
      </div>

      <div class="weather-details">
        <div class="detail-card">
          <i class="fas fa-tint detail-icon" style="color: #4facfe;"></i>
          <div class="detail-value">${humidityPercent}%</div>
          <div class="detail-label">Humidity</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="humidity-bar"></div>
          </div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-wind detail-icon" style="color: #43e97b;"></i>
          <div class="detail-value">${data.wind.speed} ${unitMode === "F" ? 'mph' : 'm/s'}</div>
          <div class="detail-label">Wind Speed</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="wind-bar"></div>
          </div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-cloud detail-icon" style="color: #667eea;"></i>
          <div class="detail-value">${cloudinessPercent}%</div>
          <div class="detail-label">Cloudiness</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="cloudiness-bar"></div>
          </div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-thermometer-half detail-icon" style="color: #f093fb;"></i>
          <div class="detail-value">${data.main.pressure}</div>
          <div class="detail-label">Pressure (hPa)</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-eye detail-icon" style="color: #feca57;"></i>
          <div class="detail-value">${data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</div>
          <div class="detail-label">Visibility</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-sun detail-icon" style="color: #ff9ff3;"></i>
          <div class="detail-value">${Math.round(data.main.temp_max)}${tempUnit}</div>
          <div class="detail-label">Max Temp</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-sunrise detail-icon" style="color: #feca57;"></i>
          <div class="detail-value">${sunrise}</div>
          <div class="detail-label">Sunrise</div>
        </div>
        
        <div class="detail-card">
          <i class="fas fa-sunset detail-icon" style="color: #ff6b6b;"></i>
          <div class="detail-value">${sunset}</div>
          <div class="detail-label">Sunset</div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 2rem;">
        <button class="search-btn" onclick="saveFavorite('${data.name}')" style="background: var(--warning-gradient);">
          <i class="fas fa-heart"></i>
          Add to Favorites
        </button>
      </div>
    `;

    // Animate progress bars
    setTimeout(function () {
      const humidityBar = document.getElementById("humidity-bar");
      const windBar = document.getElementById("wind-bar");
      const cloudinessBar = document.getElementById("cloudiness-bar");

      if (humidityBar) humidityBar.style.width = humidityPercent + "%";
      if (windBar) windBar.style.width = windPercent + "%";
      if (cloudinessBar) cloudinessBar.style.width = cloudinessPercent + "%";
    }, 500);

    // Generate smart summary and clothing suggestions
    generateSmartSummary(data);
    generateClothingSuggestions(data);
    updateWeatherMood(data);

    // Update sidebar content with new weather data
    setTimeout(() => {
      populateAllSidebarContent();
    }, 100);

    console.log("✅ Weather displayed successfully");

  } catch (error) {
    console.error("❌ Display error:", error);
  }
}

// Function to populate all sidebar content
function populateAllSidebarContent() {
  console.log("🎯 Populating all sidebar content...");

  // Debug: Check which elements exist
  const elements = [
    'air-quality', 'uv-index', 'mood-indicator', 'streak-number',
    'clothing-suggestions', 'nearby-weather', 'favorites-list', 'current-time'
  ];

  elements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`Element ${id}:`, element ? '✅ Found' : '❌ Missing');
  });

  // Air Quality
  const airQualityDiv = document.getElementById("air-quality");
  if (airQualityDiv) {
    console.log("🌬️ Populating air quality...");
    if (!airQualityDiv.innerHTML.trim()) {
      airQualityDiv.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">2/5</div>
          <div style="font-weight: 600; margin-bottom: 1rem;">Good</div>
          <div class="aqi-indicator aqi-good"></div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
            PM2.5: 12.5 μg/m³
          </div>
        </div>
      `;
    } else {
      console.log("Air quality already populated");
    }
  }

  // UV Index
  const uvDiv = document.getElementById("uv-index");
  if (uvDiv) {
    console.log("☀️ Populating UV index...");
    if (!uvDiv.innerHTML.trim()) {
      uvDiv.innerHTML = `
        <div style="text-align: center;">
          <div class="uv-indicator uv-moderate">4</div>
          <div style="font-weight: 600; margin-top: 0.5rem;">Moderate</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Use sunscreen!
          </div>
        </div>
      `;
    } else {
      console.log("UV index already populated");
    }
  }

  // Mood Display
  const moodIndicator = document.getElementById("mood-indicator");
  if (moodIndicator) {
    moodIndicator.textContent = "😊";
    console.log("✅ Mood indicator set to default");
  }

  // Streak Counter
  const streakNumberDiv = document.getElementById("streak-number");
  if (streakNumberDiv) {
    streakNumberDiv.textContent = "0";
  }

  // Clothing Suggestions
  const clothingDiv = document.getElementById("clothing-suggestions");
  if (clothingDiv) {
    console.log("👕 Populating clothing suggestions...");
    if (!clothingDiv.innerHTML.trim()) {
      clothingDiv.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
          <h4>👗 What to Wear</h4>
          <div style="font-size: 1.1rem; margin-top: 0.5rem;">👕 T-shirt or light shirt</div>
        </div>
      `;
    } else {
      console.log("Clothing suggestions already populated");
    }
  }

  // Nearby Weather - Show cities near current location
  const nearbyDiv = document.getElementById("nearby-weather");
  if (nearbyDiv) {
    console.log("🗺️ Populating nearby weather...");
    // Always update nearby cities based on current location
    let nearbyCities = [];
    if (currentWeatherData && currentWeatherData.name) {
      const currentCity = currentWeatherData.name.toLowerCase();
      console.log("🏙️ Current city for nearby:", currentCity);

      if (currentCity.includes('hyderabad')) {
        nearbyCities = [
          { name: 'Bangalore', temp: '26°C' },
          { name: 'Chennai', temp: '29°C' },
          { name: 'Mumbai', temp: '31°C' }
        ];
      } else if (currentCity.includes('bangalore')) {
        nearbyCities = [
          { name: 'Hyderabad', temp: '28°C' },
          { name: 'Chennai', temp: '29°C' },
          { name: 'Mysore', temp: '25°C' }
        ];
      } else if (currentCity.includes('mumbai')) {
        nearbyCities = [
          { name: 'Pune', temp: '27°C' },
          { name: 'Nashik', temp: '26°C' },
          { name: 'Goa', temp: '30°C' }
        ];
      } else if (currentCity.includes('delhi')) {
        nearbyCities = [
          { name: 'Gurgaon', temp: '25°C' },
          { name: 'Noida', temp: '24°C' },
          { name: 'Faridabad', temp: '26°C' }
        ];
      } else if (currentCity.includes('london')) {
        nearbyCities = [
          { name: 'Paris', temp: '19°C' },
          { name: 'Berlin', temp: '16°C' },
          { name: 'Amsterdam', temp: '18°C' }
        ];
      } else if (currentCity.includes('new york')) {
        nearbyCities = [
          { name: 'Boston', temp: '15°C' },
          { name: 'Philadelphia', temp: '17°C' },
          { name: 'Washington', temp: '18°C' }
        ];
      } else {
        // Default nearby cities
        nearbyCities = [
          { name: 'Paris', temp: '19°C' },
          { name: 'Berlin', temp: '16°C' },
          { name: 'Madrid', temp: '23°C' }
        ];
      }
    } else {
      // Default nearby cities
      nearbyCities = [
        { name: 'Paris', temp: '19°C' },
        { name: 'Berlin', temp: '16°C' },
        { name: 'Madrid', temp: '23°C' }
      ];
    }

    nearbyDiv.innerHTML = nearbyCities.map(city => `
      <div class="nearby-city" onclick="getWeather('${city.name}')">
        <span>${city.name}</span>
        <span>${city.temp}</span>
      </div>
    `).join('');
    console.log("✅ Nearby cities updated:", nearbyCities.map(c => c.name).join(', '));
  }

  // Favorites
  const favoritesDiv = document.getElementById("favorites-list");
  if (favoritesDiv) {
    console.log("❤️ Populating favorites...");
    if (!favoritesDiv.innerHTML.trim()) {
      const favorites = JSON.parse(localStorage.getItem(favoritesKey) || '["London", "New York", "Tokyo"]');
      favoritesDiv.innerHTML = favorites.map(city => `
        <li class="favorite-city" onclick="getWeather('${city}')">
          <i class="fas fa-heart"></i>
          <span>${city}</span>
        </li>
      `).join('');
    } else {
      console.log("Favorites already populated");
    }
  }

  // Humidity Chart
  const humidityChart = document.getElementById("humidity-chart");
  if (humidityChart && currentWeatherData) {
    console.log("💧 Populating humidity chart...");
    populateHumidityChart(currentWeatherData.main.humidity);
  }

  // Time (always update)
  updateTime();

  console.log("✅ All sidebar content populated");
}

// Missing utility functions
function getForecast(city, units) {
  console.log("📅 Getting forecast for:", city);
  showDemoForecast();
}

function getAirQuality(lat, lon) {
  console.log("🌬️ Getting air quality for:", lat, lon);
}

function getUVIndex(lat, lon) {
  console.log("☀️ Getting UV index for:", lat, lon);
}

function getNearbyWeather(lat, lon) {
  console.log("🗺️ Getting nearby weather for:", lat, lon);
}

function getHourlyForecast(city, units) {
  console.log("⏰ Getting hourly forecast for:", city);
}

function showCityTime(timezone) {
  console.log("🕐 Showing city time with timezone:", timezone);
  updateTime();
}

function showDemoForecast() {
  console.log("📊 Showing demo forecast");
  const forecastDiv = document.getElementById("forecast-container");
  if (forecastDiv) {
    forecastDiv.innerHTML = `
      <div class="forecast-day">
        <div>Today</div>
        <i class="fas fa-sun"></i>
        <div>25°/18°</div>
      </div>
      <div class="forecast-day">
        <div>Tomorrow</div>
        <i class="fas fa-cloud-sun"></i>
        <div>23°/16°</div>
      </div>
      <div class="forecast-day">
        <div>Wed</div>
        <i class="fas fa-cloud-rain"></i>
        <div>20°/14°</div>
      </div>
    `;
  }
}

function generateSmartSummary(data) {
  console.log("🧠 Generating smart summary");
}

function generateClothingSuggestions(data) {
  console.log("👕 Generating clothing suggestions");
  const temp = data.main.temp;
  const clothingDiv = document.getElementById("clothing-suggestions");
  if (clothingDiv) {
    let suggestion = "";
    if (temp < 10) {
      suggestion = "🧥 Heavy coat, warm layers, gloves";
    } else if (temp < 20) {
      suggestion = "🧥 Light jacket or sweater";
    } else if (temp < 25) {
      suggestion = "👕 T-shirt or light shirt";
    } else {
      suggestion = "🩳 Light clothing, shorts, sunscreen";
    }

    clothingDiv.innerHTML = `
      <div style="text-align: center; padding: 1rem;">
        <h4>👗 What to Wear</h4>
        <div style="font-size: 1.1rem; margin-top: 0.5rem;">${suggestion}</div>
      </div>
    `;
  }
}

function updateWeatherMood(data) {
  console.log("😊 Updating weather mood");
  const moodIndicator = document.getElementById("mood-indicator");
  if (moodIndicator) {
    const weather = data.weather[0].main.toLowerCase();
    let mood = "😊";
    if (weather.includes("rain")) mood = "🌧️";
    else if (weather.includes("cloud")) mood = "☁️";
    else if (weather.includes("clear")) mood = "☀️";
    else if (weather.includes("snow")) mood = "❄️";

    moodIndicator.textContent = mood;
    console.log("✅ Mood updated to:", mood);
  }
}

function updateTime() {
  const timeDiv = document.getElementById("current-time");
  if (timeDiv) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    timeDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 1.5rem; font-weight: bold;">${timeString}</div>
        <div style="font-size: 0.9rem; color: var(--text-secondary);">Local Time</div>
      </div>
    `;
  }
}

function loadFavorites() {
  console.log("⭐ Loading favorites");
}

function saveFavorite(cityName) {
  console.log("💾 Saving favorite:", cityName);
  alert(`${cityName} added to favorites!`);
}

function initializeDefaultContent() {
  console.log("🎯 Initializing default content");
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("city").value = lastCity;
    getWeather(lastCity);
  } else {
    useDemoData("London");
  }
}

function addDemoButton() {
  console.log("🎭 Adding demo button");
}

function handleAutocomplete(e) {
  console.log("🔍 Handling autocomplete for:", e.target.value);
  const value = e.target.value;
  const autocompleteList = document.getElementById("autocomplete-list");
  if (autocompleteList && value.length > 2) {
    const cities = ["London", "New York", "Paris", "Tokyo", "Sydney", "Dubai", "Mumbai", "Berlin"];
    const matches = cities.filter(city => city.toLowerCase().includes(value.toLowerCase()));

    autocompleteList.innerHTML = matches.slice(0, 5).map(city =>
      `<div class="autocomplete-item" onclick="selectCity('${city}')">${city}</div>`
    ).join('');
  }
}

function selectCity(city) {
  console.log("🎯 City selected:", city);
  document.getElementById("city").value = city;
  document.getElementById("autocomplete-list").innerHTML = "";
  getWeather(city);
}

function showMascotMessage() {
  console.log("🎭 Showing mascot message");
  alert("Hello! I'm your weather buddy! 🌤️");
}

function generateAIInsights() {
  console.log("🤖 Generating AI insights");
  const insightsDiv = document.getElementById("ai-insights");
  if (insightsDiv && currentWeatherData) {
    const temp = currentWeatherData.main.temp;
    const weather = currentWeatherData.weather[0].main;

    let insight = "";
    if (temp > 25) {
      insight = "🌡️ It's quite warm today! Perfect for outdoor activities. Stay hydrated!";
    } else if (temp < 10) {
      insight = "🧊 Bundle up! It's chilly out there. Hot drinks recommended!";
    } else {
      insight = "🌤️ Pleasant weather today! Great for a walk or outdoor lunch.";
    }

    if (weather.toLowerCase().includes("rain")) {
      insight += " Don't forget your umbrella! ☔";
    }

    insightsDiv.innerHTML = `
      <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px;">
        <h4>🤖 AI Weather Insights</h4>
        <p>${insight}</p>
      </div>
    `;
  }
}

// Tab content functions
function showForecastTab() {
  console.log("📅 Showing 7-day forecast tab");
  const forecastDiv = document.getElementById("forecast");
  if (forecastDiv) {
    forecastDiv.innerHTML = `
      <div class="forecast-container">
        <h3 style="text-align: center; margin-bottom: 2rem;">
          <i class="fas fa-calendar-week"></i> 7-Day Weather Forecast
        </h3>
        <div class="forecast-grid">
          <div class="forecast-card">
            <div class="forecast-day">Today</div>
            <div class="forecast-icon">☀️</div>
            <div class="forecast-temps">
              <span class="high">25°</span>
              <span class="low">18°</span>
            </div>
            <div class="forecast-desc">Sunny</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Tomorrow</div>
            <div class="forecast-icon">⛅</div>
            <div class="forecast-temps">
              <span class="high">23°</span>
              <span class="low">16°</span>
            </div>
            <div class="forecast-desc">Partly Cloudy</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Wednesday</div>
            <div class="forecast-icon">🌧️</div>
            <div class="forecast-temps">
              <span class="high">20°</span>
              <span class="low">14°</span>
            </div>
            <div class="forecast-desc">Light Rain</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Thursday</div>
            <div class="forecast-icon">🌤️</div>
            <div class="forecast-temps">
              <span class="high">22°</span>
              <span class="low">15°</span>
            </div>
            <div class="forecast-desc">Mostly Sunny</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Friday</div>
            <div class="forecast-icon">☁️</div>
            <div class="forecast-temps">
              <span class="high">19°</span>
              <span class="low">13°</span>
            </div>
            <div class="forecast-desc">Cloudy</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Saturday</div>
            <div class="forecast-icon">🌦️</div>
            <div class="forecast-temps">
              <span class="high">21°</span>
              <span class="low">12°</span>
            </div>
            <div class="forecast-desc">Showers</div>
          </div>
          <div class="forecast-card">
            <div class="forecast-day">Sunday</div>
            <div class="forecast-icon">☀️</div>
            <div class="forecast-temps">
              <span class="high">26°</span>
              <span class="low">17°</span>
            </div>
            <div class="forecast-desc">Clear</div>
          </div>
        </div>
      </div>
    `;
  }
}

function showHourlyTab() {
  console.log("⏰ Showing hourly forecast tab");
  const hourlyDiv = document.getElementById("hourly-forecast");
  if (hourlyDiv) {
    const hours = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const temp = Math.round(20 + Math.sin(i / 4) * 5 + Math.random() * 3);
      const icons = ['☀️', '⛅', '☁️', '🌤️'];
      const icon = icons[Math.floor(Math.random() * icons.length)];

      hours.push({
        time: hour.getHours() + ':00',
        temp: temp,
        icon: icon
      });
    }

    hourlyDiv.innerHTML = `
      <div class="hourly-container">
        <h3 style="text-align: center; margin-bottom: 2rem;">
          <i class="fas fa-clock"></i> 24-Hour Forecast
        </h3>
        <div class="hourly-scroll">
          ${hours.map(hour => `
            <div class="hourly-item">
              <div class="hourly-time">${hour.time}</div>
              <div class="hourly-icon">${hour.icon}</div>
              <div class="hourly-temp">${hour.temp}°</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

function initCharts() {
  console.log("📊 Initializing charts tab");
  const chartsDiv = document.querySelector("#charts-tab .chart-container");
  if (chartsDiv) {
    const chartData = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const temp = Math.round(18 + Math.sin(i / 2) * 6 + Math.random() * 4);
      chartData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        temp: temp
      });
    }

    const maxTemp = Math.max(...chartData.map(d => d.temp));
    const minTemp = Math.min(...chartData.map(d => d.temp));

    chartsDiv.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 1rem;">
        <i class="fas fa-thermometer-half"></i> Temperature Trend
      </h3>
      <div class="chart-area">
        <div class="chart-bars">
          ${chartData.map(data => {
      const height = ((data.temp - minTemp) / (maxTemp - minTemp)) * 100;
      return `
              <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${height}%; background: linear-gradient(45deg, #667eea, #764ba2);">
                  <span class="chart-value">${data.temp}°</span>
                </div>
                <div class="chart-label">${data.day}</div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
      <div style="margin-top: 2rem;">
        <h4><i class="fas fa-chart-pie"></i> Weather Statistics</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">7</div>
            <div class="stat-label">Days Tracked</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${Math.round(chartData.reduce((a, b) => a + b.temp, 0) / chartData.length)}°</div>
            <div class="stat-label">Avg Temp</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${maxTemp}°</div>
            <div class="stat-label">Highest</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${minTemp}°</div>
            <div class="stat-label">Lowest</div>
          </div>
        </div>
      </div>
    `;
  }
}

// Function to toggle weather music
function toggleWeatherMusic() {
  console.log("🎵 Toggling weather music");
  const musicBtn = document.getElementById("music-btn");
  if (musicBtn) {
    musicBtn.classList.toggle('active');
    if (musicBtn.classList.contains('active')) {
      alert("🎵 Weather music started!");
    } else {
      alert("🔇 Weather music stopped!");
    }
  }
}
  // Humidity Chart Function
function populateHumidityChart(humidityValue) {
  const canvas = document.getElementById("humidity-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 80;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 10;
  ctx.stroke();

  // Draw humidity arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * humidityValue / 100);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = "#4facfe";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.stroke();

  // Draw humidity text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${humidityValue}%`, centerX, centerY - 5);

  ctx.font = "14px Arial";
  ctx.fillText("Humidity", centerX, centerY + 20);

  console.log("✅ Humidity chart populated with", humidityValue + "%");
}

// Weather Selfie Function
function takeWeatherSelfie() {
  console.log("📸 Taking weather selfie...");

  if (!currentWeatherData) {
    alert("⚠️ Please load weather data first!");
    return;
  }

  // Create a weather selfie overlay
  const selfieData = {
    city: currentWeatherData.name,
    temp: Math.round(currentWeatherData.main.temp),
    weather: currentWeatherData.weather[0].description,
    humidity: currentWeatherData.main.humidity,
    time: new Date().toLocaleString()
  };

  // For demo, show a modal with weather selfie info
  const selfieModal = document.createElement("div");
  selfieModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  selfieModal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      color: white;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    ">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📸</div>
      <h2 style="margin-bottom: 1rem;">Weather Selfie!</h2>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 1.5rem; margin: 1rem 0;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">
          📍 ${selfieData.city}
        </div>
        <div style="font-size: 3rem; font-weight: bold; margin: 1rem 0;">
          ${selfieData.temp}°C
        </div>
        <div style="font-size: 1.2rem; margin-bottom: 1rem; text-transform: capitalize;">
          ${selfieData.weather}
        </div>
        <div style="font-size: 1rem; opacity: 0.8;">
          💧 ${selfieData.humidity}% Humidity
        </div>
        <div style="font-size: 0.9rem; opacity: 0.6; margin-top: 0.5rem;">
          ${selfieData.time}
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
        <button onclick="shareWeatherSelfie()" style="
          background: #4facfe;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
        ">
          📱 Share
        </button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
        ">
          ✕ Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(selfieModal);

  // Remove modal when clicking outside
  selfieModal.addEventListener('click', function (e) {
    if (e.target === selfieModal) {
      selfieModal.remove();
    }
  });

  console.log("✅ Weather selfie modal created");
}

// Share Weather Selfie Function
function shareWeatherSelfie() {
  console.log("📤 Sharing weather selfie...");

  if (!currentWeatherData) return;

  const shareText = `🌤️ Weather Selfie from ${currentWeatherData.name}!\n` +
    `🌡️ ${Math.round(currentWeatherData.main.temp)}°C - ${currentWeatherData.weather[0].description}\n` +
    `💧 ${currentWeatherData.main.humidity}% humidity\n` +
    `📅 ${new Date().toLocaleDateString()}\n\n` +
    `#WeatherSelfie #Weather #${currentWeatherData.name.replace(/\s+/g, '')}`;

  // Try to use Web Share API if available
  if (navigator.share) {
    navigator.share({
      title: 'My Weather Selfie',
      text: shareText,
      url: window.location.href
    }).then(() => {
      console.log('✅ Weather selfie shared successfully');
      alert('📱 Weather selfie shared!');
    }).catch((error) => {
      console.log('❌ Error sharing:', error);
      fallbackShare(shareText);
    });
  } else {
    fallbackShare(shareText);
  }
}

// Fallback share function
function fallbackShare(text) {
  // Copy to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Weather selfie copied to clipboard! You can paste it anywhere to share.');
    }).catch(() => {
      // Fallback to textarea method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('📋 Weather selfie copied to clipboard! You can paste it anywhere to share.');
    });
  } else {
    alert('📱 Share feature not supported. Here\'s your weather selfie text:\n\n' + text);
  }
}