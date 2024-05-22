import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Thay thế 'your-access-token' bằng access token của bạn
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0dG0wMyIsImEiOiJjbHZ3aWs2dmIwZG1pMnFvZ2JzczBxYTZwIn0.f8D93mAehFFbbIhmaH83pA';

function MapComponent() {
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (!map) {
      const newMap = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0], // Tọa độ mặc định
        zoom: 1 // Mức độ zoom mặc định
      });
      setMap(newMap);
    }

    // Clean up function để xóa map khi component unmounts
    return () => {
      if (map) map.remove();
    };
  }, [map]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation([longitude, latitude]);
    });
  }, []);

  useEffect(() => {
    if (currentLocation && map) {
      const marker = new mapboxgl.Marker()
        .setLngLat(currentLocation)
        .addTo(map);
      map.flyTo({ center: currentLocation, zoom: 12 });

      // Clean up function để xóa marker khi component unmounts
      return () => marker.remove();
    }
  }, [currentLocation, map]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  function handleInputChange(event) {
    setSearchQuery(event.target.value);
  }

  function handleSearch() {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        const locations = data.features.map(feature => ({
          name: feature.place_name,
          coordinates: feature.center
        }));
        setSuggestedLocations(locations);
      })
      .catch(error => {
        console.error('Error fetching Mapbox API:', error);
      });
  }

  return (
    <div>
      <input type="text" value={searchQuery} onChange={handleInputChange} />
      <button onClick={handleSearch}>Search</button>
      
      <ul>
        {suggestedLocations.map(location => (
          <li key={location.name}>{location.name}</li>
        ))}
      </ul>
      <div id="map" style={{ width: '100%', height: '800px' }}></div>
    </div>
  );
}

export default MapComponent;
