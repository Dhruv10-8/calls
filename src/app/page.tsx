import { fetchWeatherApi } from 'openmeteo';
import styles from "./page.module.css";

export default async function Home() {
  const params = {
    "latitude": 19.0728,
    "longitude": 72.8826,
    "daily": "weather_code"
  };

  // Fetch weather data
  const weatherUrl = "https://api.open-meteo.com/v1/forecast";
  const weatherResponses = await fetchWeatherApi(weatherUrl, params);

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location
  const weatherResponse = weatherResponses[0];
  const utcOffsetSeconds = weatherResponse.utcOffsetSeconds();
  const daily = weatherResponse.daily()!;

  const weatherData = {
    daily: {
      time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      weatherCode: daily.variables(0)!.valuesArray()!,
    },
  };

  // Fetch commodity prices
  const commodityName = 'feeder_cattle';
  const commodityResponse = await fetch('https://api.api-ninjas.com/v1/commodityprice?name='+commodityName, {
    headers: {
      'X-Api-Key': 'ck0955SxMCrczdUNquXv5JJyAMsbYwID7ubW6dcZ'
      // Replace with your actual API key
    }
  });
  
  if (!commodityResponse.ok) {
    console.error('Error fetching commodity prices:', commodityResponse.statusText);
    return null; // Handle error gracefully
  }
  
  const commodityData = await commodityResponse.json();
  
  // Prepare content to display weather data
  const weatherDisplay = weatherData.daily.time.map((time, index) => (
    <div key={index} className={styles.weatherEntry}>
      <p><strong>Date:</strong> {time.toISOString().split('T')[0]}</p>
      <p><strong>Weather Code:</strong> {weatherData.daily.weatherCode[index]}</p>
    </div>
  ));

  // Prepare content to display commodity prices
  const commodityDisplay = (
    <div className={styles.commodityEntry}>
      <h2>Commodity Prices</h2>
      {commodityData && commodityData.length > 0 ? (
        <p><strong>{commodityName.charAt(0).toUpperCase() + commodityName.slice(1)} Price:</strong> ${commodityData[0].price}</p>
      ) : (
        <p>{commodityName} Price: $257.10.</p>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Daily Weather Forecast</h1>
        {weatherDisplay}
        {commodityDisplay}
      </main>
    </div>
  );
}
