const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorBox=document.querySelector('.errordiv');
//initially vairables need

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c"; // Api Key
oldTab.classList.add("current-tab"); // current tab
getfromSessionStorage(); //to get geolocation

function switchTab(newTab) // to change tab
{ 
    if(newTab != oldTab)
    {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
        document.querySelector('.tabchange').style.left='50%';
        if(!searchForm.classList.contains("active"))
        {
            //if search tab is hidden making it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //if i am already in search tab so i have to visible my weather tab 
            document.querySelector('.tabchange').style.left='0';
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            
            //for coordinates, if we haved saved them there.
            getfromSessionStorage(); // cheking local storage to get location
        }
    }
}

userTab.addEventListener("click", () => {
    
    errorBox.classList.remove('active');  //if error box is visisble making it hidden

    if(searchInput.value) //if the search input box is not empty making it empty
    { 
        searchInput.value="";
    }
    switchTab(userTab);//pass clicked tab as input paramter
});

searchTab.addEventListener("click", () => {

    errorBox.classList.remove('active');//if error box is visisble making it hidden
    
    switchTab(searchTab);//pass clicked tab as input paramter
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates)
    {
        //if there are no local cordinates/location details
        grantAccessContainer.classList.add("active"); // to get location 
    }
    else {
        //if we found the currentlocation/cordinates we can fetch data now
        const coordinates = JSON.parse(localCoordinates); 
        fetchUserWeatherInfo(coordinates);
    }

}

// asycn function to fetch data 
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        console.log(err);// error is not working. why??

    }

}

function renderWeatherInfo(weatherInfo) {

    //fistly, we have to fethc the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // console.log(weatherInfo);


    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    if(weatherInfo?.weather?.[0]?.main=='Haze'){
        weatherIcon.src='./assets/haze.png';
    }else if(weatherInfo?.weather?.[0]?.main=='Smoke'){
        weatherIcon.src='./assets/smoke.png';
    }else if(weatherInfo?.weather?.[0]?.main=='Clouds'){
        weatherIcon.src='./assets/cloudy.png';
    }else{
        weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    }
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

function getLocation()  // to get current location from localstorage
{
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert('no gelolocation support available');
    }
}

function showPosition(position) 
{

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    // saving current location // cordinates in localstorage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


//search input actions
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

// async functions for fetching data with city name
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        
        // console.log(data)
        
        // if we get 404 error not found city
        if(data.cod=='404')
        {
            userInfoContainer.classList.remove("active");
            document.getElementById('errormsg').textContent=data.message;
            errorBox.classList.add('active');
        }else{
            errorBox.classList.remove('active');
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        
    }
    catch(err) {
        // not working
        console.log(err);
    }
}