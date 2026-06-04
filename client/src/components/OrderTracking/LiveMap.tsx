import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { MapPinIcon } from "lucide-react";
import { iconsForLeafpad } from "../../assets/assets";
import L from "leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";

export default function LiveMap({ order, liveLocation }: { order: any, liveLocation: any }) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

    // Custom delivery truck icon
    const truckIcon = new L.Icon({
        iconUrl: iconsForLeafpad.truck,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });

    // Destination pin icon
    const destinationIcon = new L.Icon({
        iconUrl: iconsForLeafpad.destination,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const destLat = order.shippingAddress?.lat ? Number(order.shippingAddress.lat) : null;
    const destLng = order.shippingAddress?.lng ? Number(order.shippingAddress.lng) : null;

    // Fetch navigation path from OSRM (Google Maps-like routing)
    useEffect(() => {
        if (!liveLocation || liveLocation.lat === 0 || !destLat || !destLng) {
            setRouteCoords([]);
            return;
        }

        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
                const { data } = await axios.get(url);
                if (data.routes && data.routes[0]) {
                    // OSRM returns coordinates as [lng, lat], we map it to [lat, lng] for leaflet
                    const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
                    setRouteCoords(coords);
                } else {
                    setRouteCoords([[liveLocation.lat, liveLocation.lng], [destLat, destLng]]);
                }
            } catch (error) {
                console.error("OSRM Routing API failed, falling back to straight line:", error);
                setRouteCoords([[liveLocation.lat, liveLocation.lng], [destLat, destLng]]);
            }
        };

        fetchRoute();
    }, [liveLocation?.lat, liveLocation?.lng, destLat, destLng]);

    // Component to re-center map when location changes and fit bounds to include both driver and destination
    function MapUpdater({ live, dest, route }: { live: [number, number] | null; dest: [number, number] | null; route: [number, number][] }) {
        const map = useMap();
        useEffect(() => {
            if (route.length > 0) {
                map.fitBounds(route, { padding: [50, 50] });
            } else if (live && dest && dest[0] !== 0) {
                map.fitBounds([live, dest], { padding: [50, 50] });
            } else if (live) {
                map.setView(live, map.getZoom());
            } else if (dest) {
                map.setView(dest, map.getZoom());
            }
        }, [live, dest, route, map]);
        return null;
    }

    return (
        <>
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <div className="relative z-0 rounded-2xl overflow-hidden border border-app-border" style={{ height: 280 }}>
                    {liveLocation && liveLocation.lat !== 0 ? (
                        <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={truckIcon}>
                                <Popup>Delivery Partner</Popup>
                            </Marker>
                            {destLat && destLng && (
                                <>
                                    <Marker position={[destLat, destLng]} icon={destinationIcon}>
                                        <Popup>Delivery Address</Popup>
                                    </Marker>
                                    <Polyline
                                        positions={routeCoords.length > 0 ? routeCoords : [[liveLocation.lat, liveLocation.lng], [destLat, destLng]]}
                                        color="#16a34a"
                                        dashArray="5, 10"
                                        weight={4}
                                    />
                                </>
                            )}
                            <MapUpdater
                                live={[liveLocation.lat, liveLocation.lng]}
                                dest={destLat && destLng ? [destLat, destLng] : null}
                                route={routeCoords}
                            />
                        </MapContainer>
                    ) : destLat && destLng ? (
                        <MapContainer center={[destLat, destLng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[destLat, destLng]} icon={destinationIcon}>
                                <Popup>Delivery Address</Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="h-full bg-app-green/5 flex-center">
                            <div className="text-center">
                                <MapPinIcon className="size-8 text-app-green/40 mx-auto mb-2" />
                                <p className="text-sm text-app-green/50 font-medium">Waiting for delivery partner location...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
