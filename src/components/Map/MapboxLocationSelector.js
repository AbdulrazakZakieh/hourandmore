import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxAccessToken } from "../../config/configMaps";

const MapboxLocationSelector = ({ onLocationChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState({ lat: 24.7136, lng: 46.7219 }); // Default to Riyadh
  const [selectedAddress, setSelectedAddress] = useState(""); // State for address
  const [zoomLevel, setZoomLevel] = useState(10); // Maintain zoom level in state

  const getAddressFromCoordinates = (lng, lat) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxAccessToken}&language=ar`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const address = data.features.length > 0 ? data.features[0].place_name : "Address not found";
        setSelectedAddress(address);
        onLocationChange({ lat, lng, address });
      })
      .catch((error) => {
        console.error("Error fetching address:", error);
      });
  };

  useEffect(() => {
    if (mapRef.current) return; // Prevent reinitialization

    mapboxgl.accessToken = mapboxAccessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: zoomLevel, // Use the zoom level from state
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Update zoom level state on map zoom changes
    mapRef.current.on("zoom", () => {
      setZoomLevel(mapRef.current.getZoom());
    });

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const coords = markerRef.current.getLngLat();
      setSelectedLocation({ lat: coords.lat, lng: coords.lng });
      getAddressFromCoordinates(coords.lng, coords.lat);
    });

    mapRef.current.on("click", (event) => {
      const { lng, lat } = event.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setSelectedLocation({ lat, lng });
      getAddressFromCoordinates(lng, lat);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationChange]);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([selectedLocation.lng, selectedLocation.lat]);
      markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
    }
  }, [selectedLocation]);

  return (
    <div style={{ position: "relative", height: "80vh" }}>
      <div ref={mapContainerRef} style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}></div>
      <div
        style={{
          position: "absolute",
          background: "white",
          padding: "10px",
          bottom: "20px",
          left: "10px",
          zIndex: 1,
        }}
      >
        {selectedLocation ? (
          <div>
            Selected Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            <br />
            Address: {selectedAddress || "Loading address..."}
            <br />
            Current Zoom: {zoomLevel.toFixed(2)}
          </div>
        ) : (
          <div>Drag the pin to select a location.</div>
        )}
      </div>
    </div>
  );
};

export default MapboxLocationSelector;
