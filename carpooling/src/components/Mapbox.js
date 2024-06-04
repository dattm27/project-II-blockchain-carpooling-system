import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxClient from '@mapbox/mapbox-sdk/services/directions';
import {Badge } from 'react-bootstrap'; 
// Thay thế 'your-access-token' bằng access token của bạn
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0dG0wMyIsImEiOiJjbHZ3aWs2dmIwZG1pMnFvZ2JzczBxYTZwIn0.f8D93mAehFFbbIhmaH83pA';
const directionsClient = MapboxClient({ accessToken: mapboxgl.accessToken });

function Map({ startPointCoordinates, endPointCoordinates, setStartPoint, setEndPoint, screen, startTime  }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedLocations, setSuggestedLocations] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [rushHour, setRushHour] = useState(0);

  //đảm bảo map được khởi tạo khi mở trang
  useEffect(() => {
    if (!map) {
      initializeMap()
      
    }
  }, []);

  useEffect (()=>{
    getCurrentLocation();
    if (startPointCoordinates &&  endPointCoordinates) calculateDistance();
  }, [map])

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

  //theo doi su thay doi cua gio khoi hanh
  useEffect(() => {
    console.log('start time: ', startTime);
    calculateDistance();
  }, [startTime])
 
  //Khởi tạo bản đồ với vị trí mặc định
  const initializeMap = () => {
    const initializedMap = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [105.8542, 21.0285], // Tọa độ mặc định Hà Nội
      zoom: 12 // Mức độ zoom mặc định
    });

    setMap(initializedMap);
    
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates = [position.coords.longitude, position.coords.latitude];
          setCurrentLocation(userCoordinates);
          if (map) {
            new mapboxgl.Marker()
              .setLngLat(userCoordinates)
              .addTo(map);
            map.flyTo({ center: userCoordinates, zoom: 14 });
          }
        },
        (error) => {
          console.error('Error obtaining geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
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

      const locations = data.features.map((feature) => ({
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
    const startCoordinates = startPointCoordinates;
    const endCoordinates = endPointCoordinates;
    console.log(startCoordinates);
    console.log(endCoordinates);
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
      //const fuelPriceForDistance = calculatedDistance * 0.1; // Giá nhiên liệu tham khảo (0.1 ETH/km)
       
      // Check if the start time is during peak hours
      const startTimeDate = new Date(startTime);
      const startHours = startTimeDate.getHours();
      const isPeakHours = (startHours >= 7 && startHours <= 9) || (startHours >= 17 && startHours <= 19);
      const baseFuelPricePerKm = 0.1;
      const peakHourSurcharge = isPeakHours ? 0.05 : 0;
      if (peakHourSurcharge) setRushHour(1);
      else setRushHour(0);
      const fuelPriceForDistance = calculatedDistance * (baseFuelPricePerKm + peakHourSurcharge); // Giá nhiên liệu tham khảo
      
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
        //map.flyTo({ center: startCoordinates, zoom: 8  });
        // Tạo một mảng các điểm trên quãng đường để tính toán bounds
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        // Thiết lập zoom và vị trí để hiển thị quãng đường trên bản đồ
        map.fitBounds(bounds, {
          padding: 30 // Khoảng cách padding từ biên của bản đồ
        });
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    }
  };

  return (
    <div>
     
     {screen === "create" && (
        <>
          {distance && <span>Distance: {distance}</span>}
        
          {(rushHour != 0  && fuelPrice) && <div> <span>Fuel Price (Estimated): {fuelPrice} </span> <Badge pill bg="danger"> Rush Hour</Badge></div> }
          {(rushHour == 0  && fuelPrice) && <div> <p>Fuel Price (Estimated): {fuelPrice}</p> </div> }
          <br></br>
        </>
      )}
      
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}

export default Map;