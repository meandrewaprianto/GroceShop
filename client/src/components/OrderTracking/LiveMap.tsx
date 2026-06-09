import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { LocateFixedIcon, PackageIcon, ClockIcon, TruckIcon } from "lucide-react";
import { iconsForLeafpad } from "../../assets/assets";
import L from "leaflet";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import type { Order } from "../../types";
import "leaflet/dist/leaflet.css";

const EXPEDITION_THRESHOLD_KM = 50;

function createDriverIcon(vehicleType: "bike" | "scooter" | "car" | string) {
    const isCar = vehicleType === "car";
    const bgColor = isCar ? "#3b82f6" : "#f97316";
    const svgIcon = isCar 
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="display:block;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.95-.68h9.56c.43 0 .81.27.95.68L19 11H5z"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="display:block;"><path d="M19.5 13.5c-1.4 0-2.6.8-3.2 2H10.7c-.5-1.2-1.7-2-3.2-2-1.9 0-3.5 1.6-3.5 3.5s1.6 3.5 3.5 3.5c1.4 0 2.6-.8 3.2-2h5.6c.5 1.2 1.7 2 3.2 2 1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3.5-3.5zm-12 5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm12 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-5.8-7.5l-2.2-4.4c-.2-.4-.6-.6-1-.6H7v2h3.2l1.8 3.6H6.5c-.8 0-1.5.7-1.5 1.5v1h2v-1h5.8l2-4h2.7v-2h-3.9z"/></svg>`;

    return L.divIcon({
        className: "custom-driver-marker",
        html: `
            <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;width:44px;height:44px;background:${bgColor};opacity:0.25;border-radius:50%;animation:marker-pulse 2s infinite ease-out;z-index:1;"></div>
                <div style="position:absolute;width:28px;height:28px;background:${bgColor};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:2;display:flex;align-items:center;justify-content:center;">
                    ${svgIcon}
                </div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
    });
}

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

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function ExpeditionMode({ order }: { order: Order }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-app-border shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="size-12 rounded-full bg-app-orange/10 flex items-center justify-center">
                    <PackageIcon className="size-6 text-app-orange" />
                </div>
                <div>
                    <h3 className="font-semibold text-app-green">Pengiriman Kurir</h3>
                    <p className="text-xs text-app-text-light">Jarak jauh — dikirim via kurir ekspedisi</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                    <TruckIcon className="size-4 shrink-0" />
                    <span>Alamat tujuan cukup jauh. Pesanan akan dikirim menggunakan kurir kami. Mohon ditunggu ya 🚚</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-app-cream rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <TruckIcon className="size-5 text-app-green" />
                        <span className="text-sm font-medium text-app-green">Kurir Ekspedisi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-app-text-light">Asal</p>
                            <p className="font-medium text-app-green">GroceShop Warehouse</p>
                        </div>
                        <div>
                            <p className="text-xs text-app-text-light">Tujuan</p>
                            <p className="font-medium text-app-green">
                                {order.shippingAddress?.city || "Alamat Kamu"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-app-green flex items-center gap-2">
                        <ClockIcon className="size-4" />
                        Status Pengiriman
                    </h4>
                    <div className="relative pl-6 space-y-4">
                        {["Packed", "Out for Delivery", "Delivered"].map((stage, i) => {
                            const currentIdx = ["Packed", "Out for Delivery", "Delivered"].indexOf(order.status);
                            const isCompleted = i <= currentIdx;
                            const isCurrent = i === currentIdx;

                            return (
                                <div key={stage} className="relative">
                                    <div className={`absolute left-[-18px] top-1 size-3 rounded-full border-2 ${
                                        isCompleted ? "bg-app-green border-app-green" : isCurrent ? "bg-app-orange border-app-orange" : "bg-white border-app-border"
                                    }`} />
                                    {i < 2 && (
                                        <div className={`absolute left-[-14px] top-4 w-0.5 h-9 ${isCompleted ? "bg-app-green" : "bg-app-border"}`} />
                                    )}
                                    <p className={`text-sm ${isCompleted ? "text-app-green font-medium" : isCurrent ? "text-app-orange font-medium" : "text-app-text-light"}`}>
                                        {stage}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-app-border pt-3 mt-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-app-text-light">Estimasi sampai</span>
                        <span className="font-semibold text-app-green">3-5 hari kerja</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LiveMap({ order, liveLocation }: { order: Order; liveLocation: { lat: number; lng: number } | null }) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; distanceKm: number } | null>(null);
    const [deliveryMode, setDeliveryMode] = useState<"loading" | "live" | "expedition" | "preDelivery">("loading");
    const prevHasLocation = useRef(false);

    const destLat = order.shippingAddress?.lat ? Number(order.shippingAddress.lat) : null;
    const destLng = order.shippingAddress?.lng ? Number(order.shippingAddress.lng) : null;

    const driverIcon = useMemo(() => createDriverIcon(order.deliveryPartner?.vehicleType || "bike"), [order.deliveryPartner?.vehicleType]);
    const destinationIcon = useMemo(() => new L.Icon({
        iconUrl: iconsForLeafpad.destination,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    }), []);

    const isDeliveryActive = order.status === "Assigned" || order.status === "Packed" || order.status === "Out for Delivery";

    useEffect(() => {
        if (!isDeliveryActive) {
            setDeliveryMode("preDelivery");
            return;
        }

        const hasLocation = liveLocation && liveLocation.lat !== 0 && !!destLat && !!destLng;
        if (!hasLocation && prevHasLocation.current) {
            setRouteCoords([]);
            setRouteInfo(null);
            setDeliveryMode("loading");
        }
        prevHasLocation.current = !!hasLocation;
    }, [liveLocation?.lat, destLat, destLng, isDeliveryActive]);

    useEffect(() => {
        if (!isDeliveryActive) return;
        if (!liveLocation || liveLocation.lat === 0 || !destLat || !destLng) return;

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
                    const mins = Math.round(route.duration / 60);

                    setRouteInfo({
                        distance: `${distanceKm.toFixed(1)} km`,
                        duration: `${mins} min`,
                        distanceKm,
                    });

                    setDeliveryMode(distanceKm >= EXPEDITION_THRESHOLD_KM ? "expedition" : "live");
                } else {
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
                console.error("OSRM failed, falling back:", error);
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
    }, [liveLocation?.lat, liveLocation?.lng, destLat, destLng, isDeliveryActive]);

    if (order.status === "Delivered" || order.status === "Cancelled") return null;

    // PRE-DELIVERY: Disembunyikan — OrderOTP sudah menangani ini
    if (deliveryMode === "preDelivery" || !isDeliveryActive) {
        return null;
    }

    // EXPEDITION MODE (>= 50km)
    if (deliveryMode === "expedition") {
        return (
            <>
                {routeInfo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                            <TruckIcon className="size-4 shrink-0" />
                            <span>
                                Jarak pengiriman <strong>{routeInfo.distance}</strong> — dikirim via kurir (tidak ada live tracking)
                            </span>
                        </div>
                    </div>
                )}
                <ExpeditionMode order={order} />
            </>
        );
    }

    // LIVE MODE — hanya tampilkan map jika ada lokasi live
    if (deliveryMode === "live") {
        return (
            <>
                {liveLocation && liveLocation.lat !== 0 ? (
                    <div className="relative z-0 rounded-2xl overflow-hidden border border-app-border/60 dark:border-zinc-800 shadow-xl" style={{ height: 380 }}>
                        <style dangerouslySetInnerHTML={{ __html: `
                            @keyframes marker-pulse {
                                0% {
                                    transform: scale(0.6);
                                    opacity: 0.8;
                                }
                                100% {
                                    transform: scale(1.3);
                                    opacity: 0;
                                }
                            }
                        `}} />

                        {/* Floating Status Card */}
                        {routeInfo && (
                            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 z-[1000] backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 shadow-lg border border-app-border/40 dark:border-zinc-800/40 rounded-2xl p-4 animate-fade-in">
                                {/* Route Info */}
                                <div className="flex items-center justify-between border-b border-app-border/40 dark:border-zinc-800/40 pb-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-app-orange/10 flex items-center justify-center">
                                            <LocateFixedIcon className="size-5 text-app-orange" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-semibold tracking-wider text-app-text-light dark:text-zinc-400">Estimasi Tiba</p>
                                            <p className="text-lg font-extrabold text-app-green dark:text-app-green-light">{routeInfo.duration}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-app-text-light dark:text-zinc-400">Jarak</p>
                                        <p className="text-sm font-bold text-app-green dark:text-app-green-light">{routeInfo.distance}</p>
                                    </div>
                                </div>

                                {/* Driver Details */}
                                {order.deliveryPartner ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {order.deliveryPartner.avatar ? (
                                                <img 
                                                    src={order.deliveryPartner.avatar} 
                                                    alt={order.deliveryPartner.name} 
                                                    className="size-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="size-10 rounded-full bg-app-green/10 dark:bg-app-green/20 flex items-center justify-center text-app-green dark:text-app-green-light font-bold text-sm border-2 border-white dark:border-zinc-800 shadow-sm">
                                                    {order.deliveryPartner.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] text-app-text-light dark:text-zinc-400">Kurir Pengantar</p>
                                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{order.deliveryPartner.name}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {order.deliveryPartner.vehicleType === 'car' ? (
                                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/40">
                                                    Mobil
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-orange-50 text-app-orange dark:bg-orange-900/30 dark:text-orange-400 px-2.5 py-1 rounded-md border border-orange-100 dark:border-orange-800/40">
                                                    Motor
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-app-text-light dark:text-zinc-400 py-1">
                                        <div className="size-2 rounded-full bg-app-orange animate-ping" />
                                        <span>Menghubungkan ke kurir...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={driverIcon}>
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
                    </div>
                ) : null}
            </>
        );
    }

    // LOADING
    return null;
}