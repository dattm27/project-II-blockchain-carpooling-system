import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MarkerIcon from './R.png';

//test map thôi
function CurrentLocationMap() {
  const [longitude, setLongitude] = useState(105.8542);
  const [latitude, setLatitude] = useState(21.0285);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    // Kiểm tra xem geolocation có được hỗ trợ không
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);
        setZoom(14); // Zoom vào vị trí hiện tại
      }, (error) => {
        console.error("Error obtaining geolocation:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <Map
      mapboxAccessToken="pk.eyJ1IjoiZGF0dG0wMyIsImEiOiJjbHZ3aWs2dmIwZG1pMnFvZ2JzczBxYTZwIn0.f8D93mAehFFbbIhmaH83pA"
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: zoom
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    >
      <Marker longitude={longitude} latitude={latitude} anchor="bottom">
        
        <img src={MarkerIcon}  style={{ width: '30px', height: '30px' }} />
    
      </Marker>
    </Map>
  );
}

export default CurrentLocationMap;
