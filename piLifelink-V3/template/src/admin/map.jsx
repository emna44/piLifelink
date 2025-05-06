import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const hospitalIcon = new L.Icon({
  iconUrl: '/hospital.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const otherIcon = new L.Icon({
  iconUrl: '/emrgency.png',
  iconSize: [40, 40],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const hospitalPosition = [36.8020620949773, 10.105520217886193];

const API_KEY = '5b3ce3597851110001cf6248bc923b0333dd4573b90d846c4a819a03';

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState({});
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/locations');
        const locs = res.data;
        setLocations(locs);

        const routeResults = await Promise.all(
          locs.map(async (loc, index) => {
            const start = hospitalPosition;
            const end = [loc.lat, loc.lng];

            if (!loc.lat || !loc.lng) return { id: loc._id || `loc-${index}`, coords: [] };

            const coords = await fetchRoute(start, end);
            return { id: loc._id || `loc-${index}`, coords };
          })
        );

        const routeMap = {};
        routeResults.forEach(route => {
          if (route.coords.length > 0) {
            routeMap[route.id] = route.coords;
          }
        });

        setRoutes(routeMap);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error.message);
      }
    };

    fetchData();
  }, []);

  const fetchRoute = async (start, end) => {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;
    try {
      const res = await axios.get(url);
      const coords = res.data.features?.[0]?.geometry?.coordinates;
      return coords ? coords.map(c => [c[1], c[0]]) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la route :', error.response?.data || error.message);
      return [];
    }
  };

  return (
    <MapContainer
      center={[35.5, 9.5]}
      zoom={7}
      style={{ height: '100vh', width: '100%' }}
      scrollWheelZoom={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={hospitalPosition} icon={hospitalIcon}>
        <Popup>Centre Hospitalier Principal</Popup>
      </Marker>

      {locations.map((loc, index) => {
        const key = loc._id || `loc-${index}`;
        const pos = [loc.lat, loc.lng];

        return (
          <React.Fragment key={key}>
            <Marker position={pos} icon={otherIcon}>
              <Popup>
                Urgent : <br />
                Latitude: {loc.lat}<br />
                Longitude: {loc.lng}
              </Popup>
            </Marker>

            {routes[key] && routes[key].length > 0 && (
              <Polyline positions={routes[key]} pathOptions={{ color: 'blue', weight: 4 }} />
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default Map;
