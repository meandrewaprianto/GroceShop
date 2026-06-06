import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { NavigationIcon, LocateFixedIcon, PackageIcon, ClockIcon, TruckIcon } from "lucide-react";
import { iconsForLeafpad } from "../../assets/assets";
import L from "leaflet";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import type { Order } from "../../types";
import "leaflet/dist/leaflet.css";

const EXPEDITION_THRESHOLD_KM = 50; // Switch to expedition mode if distance >= 50km

// Create pulsing delivery marker using Leaflet divIcon
function createPulseIcon() {
    return L.divIcon({
        className: "custom-delivery-marker",
        html: `
            <div style="position:relative;width:40px;height:40px;">
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:2;"></div>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:rgba(249,115,22,0.25);border-radius:50%;animation:pulse 2s infinite;z-index:1;"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
}

// Component to re-center map and fit bounds (declared outside parent component)
function MapUpdater({ live, dest, route }: { live: [number, number] | null; dest: [number, number] | null; route: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (route.length > 0) {
            map.fitBounds(route, { padding: [60, 60] });
        } else if (live && dest && dest[0] !== 0) {
            map.fitBounds([live, dest], { padding: [60, 60] });
        } else if (live) {
            map.setView(live, 15);
        } else if (dest) {
            map.setView(dest, 15);
        }
    }, [live, dest, route, map]);
    return null;
}

// Haversine formula to calculate straight-line distance between two coordinates (in km)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Expedition mode component (for long distance >= 50km)
function ExpeditionMode({ order }: { order: Order }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-app-border shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="size-12 rounded-full bg-app-orange/10 flex items-center justify-center">
                    <PackageIcon className="size-6 text-app-orange" />
                </div>
                <div>
                    <h3 className="font-semibold text-app-green">Expedition Shipping</h3>
                    <p className="text-xs text-app-text-light">Long distance delivery via courier partner</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Shipping Info Card */}
                <div className="bg-app-cream rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <TruckIcon className="size-5 text-app-green" />
                        <span className="text-sm font-medium text-app-green">Standard Expedition</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-app-text-light">Origin</p>
                            <p className="font-medium text-app-green">GroceShop Warehouse</p>
                        </div>
                        <div>
                            <p className="text-xs text-app-text-light">Destination</p>
                            <p className="font-medium text-app-green">
                                {order.shippingAddress?.city || "Your Address"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline Status */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-app-green flex items-center gap-2">
                        <ClockIcon className="size-4" />
                        Shipping Status
                    </h4>
                    <div className="relative pl-6 space-y-4">
                        {["Packed", "Handover to Courier", "In Transit", "Out for Delivery", "Delivered"].map((stage, i) => {
                            const currentIdx = ["Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"].indexOf(order.status);
                            const isCompleted = i <= currentIdx;
                            const isCurrent = i === currentIdx;

                            return (
                                <div key={stage} className="relative">
                                    <div className={`absolute left-[-18px] top-1 size-3 rounded-full border-2 ${
                                        isCompleted ? "bg-app-green border-app-green" : isCurrent ? "bg-app-orange border-app-orange" : "bg-white border-app-border"
                                    }`} />
                                    {i < 4 && (
                                        <div className={`absolute left-[-14px] top-4 w-0.5 h-6 ${isCompleted ? "bg-app-green" : "bg-app-border"}`} />
                                    )}
                                    <p className={`text-sm ${isCompleted ? "text-app-green font-medium" : isCurrent ? "text-app-orange font-medium" : "text-app-text-light"}`}>
                                        {stage}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Estimated delivery */}
                <div className="border-t border-app-border pt-3 mt-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-app-text-light">Estimated delivery</span>
                        <span className="font-semibold text-app-green">3-5 business days</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LiveMap({ order, liveLocation }: { order: Order; liveLocation: { lat: number; lng: number } | null }) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; distanceKm: number } | null>(null);
    const [deliveryMode, setDeliveryMode] = useState<"loading" | "live" | "expedition">("loading");
    const prevHasLocation = useRef(false);

    const destLat = order.shippingAddress?.lat ? Number(order.shippingAddress.lat) : null;
    const destLng = order.shippingAddress?.lng ? Number(order.shippingAddress.lng) : null;

    // Custom icons (memoized to prevent re-creation)
    const pulseIcon = useMemo(() => createPulseIcon(), []);
    const destinationIcon = useMemo(() => new L.Icon({
        iconUrl: iconsForLeafpad.destination,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    }), []);

    // Reset route state when live location disappears
    useEffect(() => {
        const hasLocation = liveLocation && liveLocation.lat !== 0 && !!destLat && !!destLng;
        if (!hasLocation && prevHasLocation.current) {
            setRouteCoords([]);
            setRouteInfo(null);
            setDeliveryMode("loading");
        }
        prevHasLocation.current = !!hasLocation;
    }, [liveLocation?.lat, destLat, destLng]);

    // Fetch navigation path from OSRM and determine delivery mode
    useEffect(() => {
        if (!liveLocation || liveLocation.lat === 0 || !destLat || !destLng) {
            return;
        }

        let cancelled = false;

        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${liveLocation.lng},${liveLocation.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
                const { data } = await axios.get(url);
                if (cancelled) return;
                if (data.routes && data.routes[0]) {
                    const route = data.routes[0];
                    const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
                    setRouteCoords(coords);

                    const distanceKm = route.distance / 1000;
                    const km = distanceKm.toFixed(1);
                    const mins = Math.round(route.duration / 60);

                    setRouteInfo({
                        distance: `${km} km`,
                        duration: `${mins} min`,
                        distanceKm,
                    });

                    // Determine delivery mode based on distance
                    if (distanceKm >= EXPEDITION_THRESHOLD_KM) {
                        setDeliveryMode("expedition");
                    } else {
                        setDeliveryMode("live");
                    }
                } else {
                    // If OSRM fails, fall back to haversine estimation
                    const straightDist = haversineDistance(liveLocation.lat, liveLocation.lng, destLat, destLng);
                    setRouteCoords([[liveLocation.lat, liveLocation.lng], [destLat, destLng]]);
                    setRouteInfo({
                        distance: `${straightDist.toFixed(1)} km`,
                        duration: `${Math.round(straightDist * 3)} min`,
                        distanceKm: straightDist,
                    });
                    setDeliveryMode(straightDist >= EXPEDITION_THRESHOLD_KM ? "expedition" : "live");
                }
            } catch (error) {
                if (cancelled) return;
                console.error("OSRM Routing API failed, falling back to straight line:", error);
                // Fallback: estimate with haversine
                const straightDist = haversineDistance(liveLocation.lat, liveLocation.lng, destLat, destLng);
                setRouteCoords([[liveLocation.lat, liveLocation.lng], [destLat, destLng]]);
                setRouteInfo({
                    distance: `${straightDist.toFixed(1)} km`,
                    duration: `${Math.round(straightDist * 3)} min`,
                    distanceKm: straightDist,
                });
                setDeliveryMode(straightDist >= EXPEDITION_THRESHOLD_KM ? "expedition" : "live");
            }
        };

        fetchRoute();

        return () => { cancelled = true; };
    }, [liveLocation?.lat, liveLocation?.lng, destLat, destLng]);

    // Hide everything if delivered/cancelled
    if (order.status === "Delivered" || order.status === "Cancelled") return null;

    // EXPEDITION MODE: Show expedition info instead of map
    if (deliveryMode === "expedition") {
        return (
            <>
                {/* Distance notice */}
                {routeInfo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                            <TruckIcon className="size-4 shrink-0" />
                            <span>
                                Delivery distance <strong>{routeInfo.distance}</strong> — shipped via expedition courier (no live tracking)
                            </span>
                        </div>
                    </div>
                )}
                <ExpeditionMode order={order} />
            </>
        );
    }

    // LIVE MODE (distance < 50km): Show map with real-time tracking
    if (deliveryMode === "live") {
        return (
            <>
                {/* ETA Banner - like Gojek/Grab */}
                {liveLocation && liveLocation.lat !== 0 && routeInfo && (
                    <div className="bg-white rounded-2xl p-4 mb-3 border border-app-border shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-app-orange/10 flex items-center justify-center">
                                    <LocateFixedIcon className="size-5 text-app-orange" />
                                </div>
                                <div>
                                    <p className="text-xs text-app-text-light">Estimated arrival</p>
                                    <p className="text-lg font-bold text-app-green">{routeInfo.duration}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-app-text-light">Distance</p>
                                <p className="text-sm font-semibold text-app-green">{routeInfo.distance}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="relative z-0 rounded-2xl overflow-hidden border border-app-border shadow-sm" style={{ height: 320 }}>
                    {liveLocation && liveLocation.lat !== 0 ? (
                        <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            {/* CartoDB Voyager tiles */}
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={pulseIcon}>
                                <Popup>Delivery Partner</Popup>
                            </Marker>
                            {destLat && destLng && (
                                <>
                                    <Marker position={[destLat, destLng]} icon={destinationIcon}>
                                        <Popup>Delivery Address</Popup>
                                    </Marker>
                                    <Polyline
                                        positions={routeCoords.length > 0 ? routeCoords : [[liveLocation.lat, liveLocation.lng], [destLat, destLng]]}
                                        color="#f97316"
                                        weight={5}
                                        opacity={0.8}
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
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            <Marker position={[destLat, destLng]} icon={destinationIcon}>
                                <Popup>Delivery Address</Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="h-full bg-gradient-to-br from-app-cream to-app-green/5 flex-center">
                            <div className="text-center">
                                <div className="size-16 rounded-full bg-app-orange/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                    <NavigationIcon className="size-7 text-app-orange" />
                                </div>
                                <p className="text-sm text-app-green font-medium">Waiting for delivery partner location...</p>
                                <p className="text-xs text-app-text-light mt-1">Driver will appear on map once they start</p>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    // LOADING STATE: Still determining delivery mode
    return (
        <div className="bg-white rounded-2xl p-6 border border-app-border shadow-sm">
            <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-app-cream flex items-center justify-center animate-pulse">
                    <NavigationIcon className="size-6 text-app-green/40" />
                </div>
                <div className="flex-1">
                    <div className="h-4 w-32 bg-app-cream rounded animate-pulse mb-2" />
                    <div className="h-3 w-48 bg-app-cream rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}