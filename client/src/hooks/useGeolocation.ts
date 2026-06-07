import { useState, useCallback } from "react";

interface GeoAddress {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
}

interface UseGeolocationReturn {
    detectedAddress: GeoAddress | null;
    isDetecting: boolean;
    error: string | null;
    detectLocation: () => void;
    resetDetection: () => void;
}

const useGeolocation = (): UseGeolocationReturn => {
    const [detectedAddress, setDetectedAddress] = useState<GeoAddress | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reverseGeocode = async (lat: number, lng: number): Promise<GeoAddress | null> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { "User-Agent": "GroceShop/1.0" } }
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const road = addr.road || addr.pedestrian || addr.street || "";
                const houseNumber = addr.house_number || "";
                const streetAddress = [houseNumber, road].filter(Boolean).join(" ");

                return {
                    address: streetAddress || addr.display_name?.split(",")[0]?.trim() || "",
                    city:
                        addr.city ||
                        addr.town ||
                        addr.village ||
                        addr.municipality ||
                        addr.county ||
                        "",
                    state: addr.state || "",
                    zip: addr.postcode || "",
                    lat,
                    lng,
                };
            }
            return null;
        } catch {
            return null;
        }
    };

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await reverseGeocode(latitude, longitude);
                if (address) {
                    setDetectedAddress(address);
                    setError(null);
                } else {
                    // If reverse geocoding fails, at least provide coordinates
                    setDetectedAddress({
                        address: "",
                        city: "",
                        state: "",
                        zip: "",
                        lat: latitude,
                        lng: longitude,
                    });
                    setError("Could not get address details. Please fill in manually.");
                }
                setIsDetecting(false);
            },
            (err) => {
                setIsDetecting(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Location access denied. Please enable location services or enter address manually.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Location information unavailable. Please enter address manually.");
                        break;
                    case err.TIMEOUT:
                        setError("Location request timed out. Please enter address manually.");
                        break;
                    default:
                        setError("Could not detect location. Please enter address manually.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, []);

    const resetDetection = useCallback(() => {
        setDetectedAddress(null);
        setError(null);
        setIsDetecting(false);
    }, []);

    return { detectedAddress, isDetecting, error, detectLocation, resetDetection };
};

export default useGeolocation;