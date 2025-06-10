// Weather icons mapping
const weatherIcons = {
    'clear': 'fas fa-sun',
    'pcloudy': 'fas fa-cloud-sun',
    'mcloudy': 'fas fa-cloud',
    'cloudy': 'fas fa-cloud',
    'humid': 'fas fa-water',
    'lightrain': 'fas fa-cloud-rain',
    'oshower': 'fas fa-cloud-showers-heavy',
    'ishower': 'fas fa-cloud-rain',
    'lightsnow': 'fas fa-snowflake',
    'rain': 'fas fa-cloud-showers-heavy',
    'snow': 'fas fa-snowflake',
    'rainsnow': 'fas fa-cloud-meatball',
    'ts': 'fas fa-bolt',
    'tsrain': 'fas fa-poo-storm'
};

// Travel recommendations based on weather
const travelTips = {
    'clear': 'Perfect weather for sightseeing! Don\'t forget sunscreen and sunglasses.',
    'pcloudy': 'Good weather for outdoor activities. Light jacket recommended.',
    'mcloudy': 'Great weather for museum visits and indoor attractions.',
    'cloudy': 'Consider indoor activities like museums or shopping.',
    'humid': 'Stay hydrated and plan indoor activities during peak hours.',
    'lightrain': 'Pack an umbrella! Good time for museums and cafes.',
    'oshower': 'Bring a raincoat and plan some indoor activities.',
    'ishower': 'Have some indoor backup plans ready.',
    'lightsnow': 'Dress warmly! Great time for winter sports or cozy cafes.',
    'rain': 'Perfect for museum tours and local cuisine exploration.',
    'snow': 'Bundle up! Enjoy the winter wonderland or stay cozy indoors.',
    'rainsnow': 'Dress in layers and waterproof clothing recommended.',
    'ts': 'Stay indoors and explore local indoor attractions.',
    'tsrain': 'Best to stick to indoor activities.'
};

document.addEventListener('DOMContentLoaded', () => {
    const weatherForm = document.getElementById('weather-form');
    const cityButtons = document.querySelectorAll('.city-btn');

    // Add click handlers for quick-access city buttons
    cityButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('city').value = button.dataset.city;
            weatherForm.dispatchEvent(new Event('submit'));
        });
    });

    weatherForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const city = document.getElementById('city').value;
        const forecastDiv = document.getElementById('forecast');
        const travelTipsDiv = document.getElementById('travel-tips');
        const tipsContent = document.querySelector('.tips-content');
        
        try {
            // First, get coordinates for the city using OpenStreetMap Nominatim API
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
            const geocodeResponse = await fetch(geocodeUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'WeatherForecastApp/1.0'
                }
            });
            const geocodeData = await geocodeResponse.json();
            
            if (!geocodeData || geocodeData.length === 0) {
                throw new Error('City not found. Please try another European city.');
            }
            
            const { lat, lon } = geocodeData[0];
            
            // Now fetch weather with the correct coordinates
            const weatherUrl = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherText = await weatherResponse.text();
            
            if (weatherText.startsWith('ERR:')) {
                throw new Error(weatherText);
            }
            
            const weatherData = JSON.parse(weatherText);
            displayForecast(weatherData, city);
            
        } catch (error) {
            console.error('Error:', error);
            forecastDiv.innerHTML = `<p class="error"><i class="fas fa-exclamation-circle"></i> ${error.message}</p>`;
            travelTipsDiv.classList.add('hidden');
        }
    });
});

function displayForecast(data, cityName) {
    const forecastDiv = document.getElementById('forecast');
    const travelTipsDiv = document.getElementById('travel-tips');
    const tipsContent = document.querySelector('.tips-content');
    
    forecastDiv.innerHTML = ''; // Clear previous results
    
    if (!data.dataseries) {
        forecastDiv.innerHTML = '<p class="error">Invalid weather data received</p>';
        travelTipsDiv.classList.add('hidden');
        return;
    }

    // Display city name
    forecastDiv.innerHTML = `<h2 class="city-header">7-Day Forecast for ${cityName}</h2>`;
    
    // Create forecast grid
    const forecastGrid = document.createElement('div');
    forecastGrid.className = 'forecast-grid';
    
    let predominantWeather = {};
    
    data.dataseries.forEach(day => {
        // Create a date from the timepoint (which represents hours from now)
        const date = new Date();
        date.setHours(date.getHours() + day.timepoint);
        
        const weatherIcon = weatherIcons[day.weather] || 'fas fa-cloud-question';
        
        // Track weather frequency for travel tips
        predominantWeather[day.weather] = (predominantWeather[day.weather] || 0) + 1;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <h3>${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
            <i class="${weatherIcon} weather-icon"></i>
            <p class="temp"><i class="fas fa-temperature-high"></i> ${day.temp2m}°C</p>
            <p class="weather-desc">${getWeatherDescription(day.weather)}</p>
            <p class="wind"><i class="fas fa-wind"></i> ${day.wind10m.speed} m/s</p>
            <p class="clouds"><i class="fas fa-cloud"></i> ${day.cloudcover}%</p>
        `;
        forecastGrid.appendChild(forecastItem);
    });
    
    forecastDiv.appendChild(forecastGrid);
    
    // Generate travel tips based on predominant weather
    const mostCommonWeather = Object.entries(predominantWeather)
        .sort((a, b) => b[1] - a[1])[0][0];
    
    tipsContent.innerHTML = `
        <div class="tip-card">
            <i class="fas fa-suitcase"></i>
            <p>${travelTips[mostCommonWeather]}</p>
            <p class="extra-tip">💡 Don't forget to check local attractions and book your accommodations in advance!</p>
        </div>
    `;
    travelTipsDiv.classList.remove('hidden');
}

function getWeatherDescription(code) {
    const weatherCodes = {
        'clear': 'Clear Sky',
        'pcloudy': 'Partly Cloudy',
        'mcloudy': 'Mostly Cloudy',
        'cloudy': 'Cloudy',
        'humid': 'Humid',
        'lightrain': 'Light Rain',
        'oshower': 'Occasional Showers',
        'ishower': 'Isolated Showers',
        'lightsnow': 'Light Snow',
        'rain': 'Rain',
        'snow': 'Snow',
        'rainsnow': 'Rain and Snow',
        'ts': 'Thunderstorm',
        'tsrain': 'Thunderstorm with Rain'
    };
    return weatherCodes[code] || code;
}
