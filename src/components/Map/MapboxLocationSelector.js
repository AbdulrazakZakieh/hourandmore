import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { mapboxAccessToken } from '../../config/configMaps';

const MapboxLocationSelector = ({ onLocationChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(""); // State for address

  // Function to get the address from coordinates
  const getAddressFromCoordinates = (lng, lat) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxAccessToken}&language=ar`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const address = data.features.length > 0 ? data.features[0].place_name : "Address not found";
        setSelectedAddress(address); // Update address state
        onLocationChange({ lat, lng, address }); // Pass updated data to parent
      })
      .catch((error) => {
        console.error("Error fetching address:", error);
      });
  };

  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [46.7219, 24.7136], // Default to Riyadh
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Initialize the draggable marker only once
    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([46.7219, 24.7136]) // Default marker location (Riyadh)
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const coords = markerRef.current.getLngLat();
      setSelectedLocation({ lat: coords.lat, lng: coords.lng });
      getAddressFromCoordinates(coords.lng, coords.lat); // Fetch address after drag
    });

    // To set the location and fetch the address when the map is clicked
    mapRef.current.on("click", (event) => {
      const { lng, lat } = event.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setSelectedLocation({ lat, lng });
      getAddressFromCoordinates(lng, lat); // Fetch address after click
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [onLocationChange]);

  return (
    <div style={{ position: "relative", height: "80vh" }}>
      <div ref={mapContainerRef} style={{ position: "absolute", top: 0, bottom: 0, width: "100%" }}></div>
      <div style={{ position: "absolute", background: "white", padding: "10px", bottom: "20px", left: "10px", zIndex: 1 }}>
        {selectedLocation ? (
          <div>
            Selected Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            <br />
            Address: {selectedAddress || "Loading address..."}
          </div>
        ) : (
          <div>Drag the pin to select a location.</div>
        )}
      </div>
    </div>
  );
};

export default MapboxLocationSelector;
