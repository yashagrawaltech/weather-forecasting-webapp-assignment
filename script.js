const tempElement = document.querySelector("#temperature");
const windElement = document.querySelector("#wind");
const humidityElement = document.querySelector("#humidity");
const cityElement = document.querySelector("#city-name");
const imgElement = document.querySelector("#image");
const dateElement = document.querySelector("#date");
const cardsContainer = document.querySelector(".cards");
const form = document.querySelector("#form");
const useLocationBtn = document.querySelector("#use-location-btn");
const errorElement = document.querySelector("#error-elem");

const setErrorMessage = (message) => {
    errorElement.classList.remove("hidden");
    errorElement.classList.add("inline-block");
    errorElement.textContent = message;
};

const UpdateUI = (name, temperature, humidity, wind, img) => {
    tempElement.textContent = `${temperature} c`;
    humidityElement.textContent = humidity;
    windElement.textContent = `${wind} kph`;
    cityElement.textContent = name;
    imgElement.setAttribute("src", img);

    // Date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    dateElement.textContent = `(${year}-${month}-${day})`;
};

const fetchWheatherDetails = async (cityName) => {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=5e790bf48b9d486d99b171939250204&q=${cityName}&aqi=no`
        );
        const result = await response.json();

        if (result.error) {
            setErrorMessage(result.error.message);
            return;
        }

        const { name } = result.location;
        const {
            temp_c: temperature,
            humidity,
            wind_kph: wind,
        } = result.current;

        const { icon } = result.current.condition;

        // console.log(temperature);
        UpdateUI(name, temperature, humidity, wind, icon);
    } catch (error) {
        // console.log(error);
        setErrorMessage("Unable to retrieve your location.");
    }
};

const fetchWheatherForecast = async (cityName) => {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=5e790bf48b9d486d99b171939250204&q=${cityName}&days=6&aqi=no&alerts=no`
        );
        const result = await response.json();

        if (result.error) {
            setErrorMessage(result.error.message);
            return;
        }

        const { forecastday: forecast } = result.forecast;

        cardsContainer.innerHTML = "";

        forecast.forEach((f, idx) => {
            if (idx === 0) return;
            const el = document.createElement("div");
            el.classList = "card rounded-lg h-full p-4 border min-w-56";
            el.innerHTML = `
                <h3>(${f.date})</h3>
                <span class="w-14 h-14 inline-block bg-white p-1 rounded-sm mt-2">
                    <img class="h-full object-contain" src="${f.day.condition.icon}">
                </span>
                <div class="mt-2 flex flex-col gap-1">
                    <h4 class="text-md">Temperature: <span class="temp">${f.day.avgtemp_c} c</span></h4>
                    <h4 class="text-md">Wind: <span class="wind">${f.day.maxwind_kph} kph</span></h4>
                    <h4 class="text-md">Humidity: <span class="humidity">${f.day.avghumidity}</span></h4>
                </div>
            `;
            cardsContainer.appendChild(el);
        });
    } catch (error) {
        // console.log(error);
        setErrorMessage("Unable to retrieve your location.");
    }
};

form.addEventListener("submit", (e) => {
    e.preventDefault();

    errorElement.classList.add("hidden");
    errorElement.classList.remove("inline-block");

    const formData = new FormData(form);

    const cityName = formData.get("name");
    if (!cityName) return;

    fetchWheatherDetails(cityName);
    fetchWheatherForecast(cityName);
});

useLocationBtn.addEventListener("click", () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        setErrorMessage("Geolocation is not supported by this browser.");
    }

    errorElement.classList.add("hidden");
    errorElement.classList.remove("inline-block");

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        // console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        fetchWheatherDetails(`${latitude},${longitude}`);
        fetchWheatherForecast(`${latitude},${longitude}`);
    }

    function error() {
        setErrorMessage("Unable to retrieve your location.");
    }
});
