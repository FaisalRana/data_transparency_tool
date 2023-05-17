import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css"; // Import custom CSS file for styling

const App = () => {
  const [browserData, setBrowserData] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [weatherData, setWeatherData] = useState({});
  const [timeZone, setTimeZone] = useState("");
  const [temp, setTemp] = useState("");
  const [feelsLike, setFeelsLike] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [weatherMain, setWeatherMain] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [batteryCharging, setBatteryCharging] = useState(null);
  const [pluginsArray, setPluginsArray] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const getLocation = () => {
    document.body.style.cursor = "wait";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          // Reverse geocode the user's location to get the address
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          fetch(url)
            .then((response) => response.json())
            .then((data) => setAddress(data.display_name))
            .catch((error) => console.error(error));
        },
        (error) => {
          console.error(error);
        }
      );
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeather(latitude, longitude);
        setUserLocation({ lat: latitude, lng: longitude });
        document.body.style.cursor = "";
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const getWeather = async (lat, lon) => {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${
        import.meta.env.VITE_REACT_APP_WEATHER_API_KEY
      }`
    );
    const weatherData = await weatherResponse.json();

    setTimeZone(weatherData.timezone);
    const celsius = weatherData.current.temp - 273;
    const fahrenheit = Math.floor(celsius * (9 / 5) + 32);

    // Calculating Fahrenheit temperature to the nearest integer
    setTemp(fahrenheit);
    const celsius_ = weatherData.current.feels_like - 273;
    const fahrenheit_ = Math.floor(celsius_ * (9 / 5) + 32);
    setFeelsLike(fahrenheit_);
    setWeatherIcon(weatherData.current.weather[0].icon);
    setWeatherDescription(weatherData.current.weather[0].description);
    setWeatherMain(weatherData.current.weather[0].main);

    // Set weather data in state
    setWeatherData({
      timezone: weatherData.timezone,
      temperature: Math.round(weatherData.current.temp - 273.15),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      coordinates: `${lat}, ${lon}`,
    });

    // const weatherResponse = await fetch(
    //   `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alerts&units=metric&appid=`
    // );
    // const weatherData = await weatherResponse.json();
    // setWeatherData({
    //   city: weatherData.timezone.split("/").pop(),
    //   temperature: Math.round(weatherData.current.temp),
    //   description: weatherData.current.weather[0].description,
    //   icon: weatherData.current.weather[0].icon,
    // });
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const plugins = navigator.plugins
      ? Array.from(navigator.plugins).map((plugin) => plugin.name)
      : null;
    setPluginsArray(plugins);
    if ("getBattery" in navigator) {
      navigator.getBattery().then((battery) => {
        // Initial battery level
        setBatteryLevel(Math.floor(battery.level * 100));
        setBatteryCharging(battery.charging);

        // Update battery level when it changes
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.floor(battery.level * 100));
        });
      });
    } else {
      // Battery API not supported
      console.log("Battery API not supported");
    }
  }, []);

  useEffect(() => {
    const getBrowserData = async () => {
      const response = await fetch("https://api.ipify.org?format=json");
      const { ip } = await response.json();

      setBrowserData({
        ip,
        browser: navigator.userAgent,
        version: navigator.appVersion,
        os: navigator.platform,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        // battery: batteryLevel,
        // referrer: document.referrer,
        platform: navigator.platform,
        location: window.location.href,
        // cookies: document.cookie,
      });
    };

    getBrowserData();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="content">
          <section className="description">
            <Typography variant="body1">
              Welcome to the Data Transparency Tool! This tool allows you to see
              what kind of information is being collected or visible about you
              when you browse the internet. It provides insights into your
              browser data, location, weather, and more. Stay informed and take
              control of your online privacy!
            </Typography>
          </section>
        </div>
      </header>
      <div className="background">
        <div className="mirror">
          <div className="left-panel">
            <div>
              <Card className="card">
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              className="property"
                            >
                              Property
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              className="value"
                            >
                              Value
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(browserData).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="property">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </TableCell>
                            <TableCell className="value">{value}</TableCell>
                          </TableRow>
                        ))}
                        <TableCell className="property">Battery: </TableCell>
                        <TableCell className="value">
                          {batteryLevel}% Charging: {batteryCharging && "true"}
                        </TableCell>
                        <TableRow>
                          <TableCell className="property">Plugins: </TableCell>
                          <TableCell className="value">
                            {pluginsArray.map((plugin) => (
                              <div key={plugin}>{plugin}</div>
                            ))}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="property">
                            Mouse Coordinates:{" "}
                          </TableCell>
                          <TableCell className="value">
                            {position.x}, {position.y}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="right-panel">
            <Card className="card">
              <CardContent>
                <Typography variant="h6" gutterBottom className="title">
                  Weather
                </Typography>
                <img
                  src={`https://openweathermap.org/img/w/${weatherIcon}.png`}
                  alt="Weather Icon"
                  className="weather-icon"
                />
                <Typography variant="subtitle1" className="location">
                  Location: {address}
                </Typography>
                <Typography variant="subtitle1" className="timezone">
                  Timezone: {timeZone}
                </Typography>
                <Typography variant="subtitle1" className="temperature">
                  Temperature: {temp} °F
                </Typography>
                <Typography variant="subtitle1" className="feels-like">
                  Feels Like: {feelsLike} °F
                </Typography>
                <Typography variant="subtitle1" className="description">
                  Weather: {weatherDescription}
                </Typography>
              </CardContent>
            </Card>
            <Card className="map-card">
              {userLocation && (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  className="map-container"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreet
  map.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>
                </MapContainer>
              )}
              <Button onClick={getLocation}>Get Location</Button>
            </Card>
          </div>
        </div>
      </div>
      <footer className="footer">
        <Typography variant="body2" color="inherit">
          © 2023 The Data Awareness Project. All rights reserved.
        </Typography>
      </footer>
    </div>
  );
};

export default App;
