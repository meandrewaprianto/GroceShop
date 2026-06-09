import { useEffect, useState, useRef } from "react"
import type { Address } from "../types";
import { MapPinIcon, PlusIcon } from "lucide-react";
import Loading from "../components/Loading";
import AddressCard from "../components/AddressCard";
import AddressForm from "../components/AddressForm";
import { useAuth } from "../context/AuthContext";
import useGeolocation from "../hooks/useGeolocation";
import api from "../config/api";
import toast from "react-hot-toast";

const Addresses = () => {

    const { updateUser } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        label: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        lat: 0,
        lng: 0,
        isDefault: false,
    });

    const { detectedAddress, isDetecting, error: geoError, detectLocation, resetDetection } = useGeolocation();

    // Ref to track if we already auto-detected to avoid repeated detection
    const hasAutoDetected = useRef(false);

    // Auto-detect location when the form opens (only for new addresses)
    useEffect(() => {
        if (showForm && !editingId && !hasAutoDetected.current) {
            hasAutoDetected.current = true;
            detectLocation();
        }
    }, [showForm, editingId, detectLocation]);

    // When geolocation returns an address, pre-fill the form
    useEffect(() => {
        if (detectedAddress && showForm && !editingId) {
            setForm((prev) => ({
                ...prev,
                address: detectedAddress.address,
                city: detectedAddress.city,
                state: detectedAddress.state,
                zip: detectedAddress.zip,
                lat: detectedAddress.lat,
                lng: detectedAddress.lng,
            }));
        }
    }, [detectedAddress, showForm, editingId]);

    const resetForm = () => {
        setForm({
            label: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            lat: 0,
            lng: 0,
            isDefault: false,
        });
        setShowForm(false);
        setEditingId(null);
        hasAutoDetected.current = false;
        resetDetection();
    }

    // Gunakan koordinat dari hasil deteksi lokasi, atau fallback geocode dari alamat
    const getCoordinates = async (): Promise<{ lat: number; lng: number } | null> => {
        // If we already have lat/lng from geolocation, use it directly
        if (form.lat && form.lng) {
            return { lat: form.lat, lng: form.lng };
        }

        // Fallback: geocode alamat menggunakan OpenStreetMap Nominatim API
        const query = `${form.address}, ${form.city}, ${form.state}, ${form.zip}`;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                { headers: { "User-Agent": "GroceShop/1.0" } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
            }
        } catch (err) {
            console.warn("Geocoding failed, using approximate coords:", err);
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.address || !form.address.trim()) {
            toast.error("Nama jalan (street address) wajib diisi!");
            return;
        }
        if (!form.state || !form.state.trim()) {
            toast.error("Provinsi (state) wajib diisi!");
            return;
        }

        try {
            const coords = await getCoordinates();
            if (!coords || !coords.lat || !coords.lng || coords.lat === 0 || coords.lng === 0) {
                toast.error("Lokasi koordinat tidak ditemukan. Mohon pilih alamat dari rekomendasi yang muncul.");
                return;
            }
            const payload = { ...form, ...coords };

            if (editingId) {
                const { data } = await api.put(`/addresses/${editingId}`, payload)
                setAddresses(data.addresses);
                updateUser({ addresses: data.addresses });
                toast.success("Address Updated!");
            } else {
                const { data } = await api.post(`/addresses/`, payload);
                setAddresses(data.addresses);
                updateUser({ addresses: data.addresses });
                toast.success("Address Created!");
            }
            resetForm();
        } catch (error: unknown) {
            if(error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    const onEditHandler = (add: Address) => {
        setForm({
            label: add.label,
            address: add.address,
            city: add.city,
            state: add.state,
            zip: add.zip,
            lat: add.lat,
            lng: add.lng,
            isDefault: add.isDefault,
        });
        setEditingId(add.id);
        setShowForm(true);
    }



    useEffect(() => {
        api.get('/addresses').then(({ data }) => {
            setAddresses(data.addresses);
        }).catch((error: unknown) => {
             if(error instanceof Error) {
                toast.error(error.message);
            }
        }).finally(() => {
            setLoading(false);
        })
    }, [])

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-app-green">My addresses</h1>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors flex items-center gap-2">
                        <PlusIcon className="size-4" /> Add Address
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && <AddressForm resetForm={resetForm} handleSubmit={handleSubmit} form={form} setForm={setForm} editingId={editingId} detectLocation={detectLocation} isDetecting={isDetecting} geoError={geoError} />}


                {/* Addresses List */}
                {loading ? (
                    <Loading />
                ) : addresses.length === 0 ? (
                    <div className="text-center py-16">
                        <MapPinIcon className="size-16 text-app-border mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-app-green mb-2">No addresses saved</h2>
                        <p className="text-sm text-app-text-light">Add an address for faster checkout</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <AddressCard key={addr.id} addr={addr} onEditHandler={onEditHandler} setAddresses={setAddresses} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Addresses