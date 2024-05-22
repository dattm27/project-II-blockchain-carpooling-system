import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import mapboxgl from 'mapbox-gl';
import MapboxClient from '@mapbox/mapbox-sdk/services/directions';

// Thay thế 'your-access-token' bằng access token của bạn
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0dG0wMyIsImEiOiJjbHZ3aWs2dmIwZG1pMnFvZ2JzczBxYTZwIn0.f8D93mAehFFbbIhmaH83pA';
const directionsClient = MapboxClient({ accessToken: mapboxgl.accessToken });

function Map({ startPointCoordinates, endPointCoordinates, setStartPoint,  setEndPoint }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);

  useEffect(() => {
    initializeMap();
    console.log("init")
  }, []);

  useEffect(() => {
    if (selectedStartLocation && selectedEndLocation) {
      calculateDistance();
    }
  }, [selectedStartLocation, selectedEndLocation]);

  useEffect(() => {
    console.log(startPointCoordinates);
    console.log(endPointCoordinates);
    calculateDistance();

  }, [startPointCoordinates, endPointCoordinates]);

  const initializeMap = () => {
    const initializedMap = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0], // Tọa độ mặc định
      zoom: 1 // Mức độ zoom mặc định
    });
    setMap(initializedMap);
  };

  const handleInputChange = (inputValue) => {
    setSearchQuery(inputValue);
    fetchLocations(inputValue);
  };

  const handleStartLocationChange = (selectedOption) => {
    setSelectedStartLocation(selectedOption);
    if (setStartPoint) {
      setStartPoint(selectedOption.value);
    }
  };

  const handleEndLocationChange = (selectedOption) => {
    setSelectedEndLocation(selectedOption);
    if (setEndPoint) {
      setEndPoint(selectedOption.value);
    }
  };

  const fetchLocations = async (inputValue) => {
    if (!inputValue) {
      return;
    }

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${inputValue}.json?access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      
      const locations = data.features.map(feature => ({
        value: feature.place_name,
        label: feature.place_name,
        name: feature.place_name,
        coordinates: feature.center
      }));
      setSuggestedLocations(locations);
    } catch (error) {
      console.error('Error fetching Mapbox API:', error);
    }
  };

  const calculateDistance = async () => {
    // const startCoordinates = selectedStartLocation.coordinates;
    // const endCoordinates = selectedEndLocation.coordinates;
    const startCoordinates = startPointCoordinates;
    const endCoordinates = endPointCoordinates;
  
    try {
      const response = await directionsClient.getDirections({
        profile: 'driving',
        waypoints: [
          { coordinates: startCoordinates },
          { coordinates: endCoordinates }
        ],
        geometries: 'geojson'
      }).send();

      const route = response.body.routes[0];
      const calculatedDistance = route.distance / 1000; // Đổi đơn vị từ mét sang kilômét
      setDistance(`${calculatedDistance.toFixed(2)} km`);
      const fuelPriceForDistance = calculatedDistance * 0.1; // Giá nhiên liệu tham khảo (0.2 ETH/km)
      setFuelPrice(`${fuelPriceForDistance.toFixed(2)} ETH`);
      if (map) {
        if (routeLayer) {
            map.removeLayer(routeLayer);
          }
          if (map.getSource('route')) {
            map.removeSource('route');
          }
        const geojson = {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        };
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
        setRouteLayer('route');
        map.flyTo({ center: startCoordinates, zoom: 8 });
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div>
      {/* <Select
        value={selectedStartLocation}
        onChange={handleStartLocationChange}
        options={suggestedLocations}
        onInputChange={handleInputChange}
        placeholder="Choose starting location..."
        isClearable
        isSearchable
        onMenuOpen={() => fetchLocations(searchQuery)}
      />
      <Select
        value={selectedEndLocation}
        onChange={handleEndLocationChange}
        options={suggestedLocations}
        onInputChange={handleInputChange}
        placeholder="Choose destination..."
        isClearable
        isSearchable
        onMenuOpen={() => fetchLocations(searchQuery)}
      /> */}
      {distance && <p>Distance: {distance}</p>}
      {fuelPrice && <p>Fuel Price (Estimated): {fuelPrice}</p>}
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}

export default Map;
