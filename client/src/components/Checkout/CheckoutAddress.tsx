import { useEffect, useRef, useState } from 'react';
import { ChevronRightIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';
import AddressForm from '../AddressForm';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import toast from 'react-hot-toast';

const CheckoutAddress = ({ address, setAddress, setStep }: any) => {
    const { user, updateUser } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
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
    const prevDetectedRef = useRef<any>(null);

    const handleDetectLocation = async () => {
        detectLocation();
    };

    // When geolocation returns an address, pre-fill the modal form
    useEffect(() => {
        if (detectedAddress && detectedAddress !== prevDetectedRef.current) {
            prevDetectedRef.current = detectedAddress;
            setNewAddressForm((prev: any) => ({
                ...prev,
                label: prev.label || "Home",
                address: detectedAddress.address || prev.address,
                city: detectedAddress.city || prev.city,
                state: detectedAddress.state || prev.state,
                zip: detectedAddress.zip || prev.zip,
                lat: detectedAddress.lat,
                lng: detectedAddress.lng,
            }));
        }
    }, [detectedAddress]);

    const getCoordinatesForNewAddress = async (): Promise<{ lat: number; lng: number } | null> => {
        if (newAddressForm.lat && newAddressForm.lng) {
            return { lat: newAddressForm.lat, lng: newAddressForm.lng };
        }
        const query = `${newAddressForm.address}, ${newAddressForm.city}, ${newAddressForm.state}, ${newAddressForm.zip}`;
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

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddressForm.address || !newAddressForm.address.trim()) {
            toast.error("Nama jalan (street address) wajib diisi!");
            return;
        }
        if (!newAddressForm.state || !newAddressForm.state.trim()) {
            toast.error("Provinsi (state) wajib diisi!");
            return;
        }

        try {
            const coords = await getCoordinatesForNewAddress();
            if (!coords || !coords.lat || !coords.lng || coords.lat === 0 || coords.lng === 0) {
                toast.error("Lokasi koordinat tidak ditemukan. Mohon pilih alamat dari rekomendasi yang muncul.");
                return;
            }
            const payload = { ...newAddressForm, ...coords };

            const { data } = await api.post(`/addresses/`, payload);
            updateUser({ addresses: data.addresses });

            const newAddr = data.addresses[data.addresses.length - 1];
            if (newAddr) {
                setAddress({
                    id: newAddr.id,
                    label: newAddr.label,
                    address: newAddr.address,
                    city: newAddr.city,
                    state: newAddr.state,
                    zip: newAddr.zip,
                    isDefault: newAddr.isDefault,
                    lat: newAddr.lat,
                    lng: newAddr.lng,
                });
            }

            toast.success("Alamat berhasil ditambahkan!");
            setShowAddModal(false);
            setNewAddressForm({
                label: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                lat: 0,
                lng: 0,
                isDefault: false,
            });
            resetDetection();
        } catch (error: any) {
            toast.error(error.message || "Failed to add address");
        }
    };



    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-app-green mb-5 flex items-center gap-2">
                <MapPinIcon className="size-5" /> Alamat Pengiriman
            </h2>

            {/* Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 ? (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-app-green mb-3">Pilih Alamat Terdaftar</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {user.addresses.map((addr: any) => (
                            <div
                                key={addr.id || addr.label}
                                onClick={() => setAddress({
                                    id: addr.id,
                                    label: addr.label,
                                    address: addr.address,
                                    city: addr.city,
                                    state: addr.state,
                                    zip: addr.zip,
                                    lat: addr.lat,
                                    lng: addr.lng,
                                })}
                                className={`p-4 rounded-xl border cursor-pointer transition-colors ${address.id === addr.id ? 'border-app-green bg-app-cream' : 'border-app-border hover:bg-app-cream'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPinIcon className="size-4 text-app-green" />
                                    <span className="font-semibold text-zinc-900 text-sm">{addr.label}</span>
                                    {addr.isDefault && <span className="text-[10px] font-semibold text-app-orange uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-full">Default</span>}
                                </div>
                                <p className="text-sm text-zinc-600 truncate">{addr.address}</p>
                                <p className="text-xs text-zinc-500">{addr.city}, {addr.state} {addr.zip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-app-border rounded-xl mb-6 bg-app-cream/30">
                    <MapPinIcon className="size-10 text-app-border mx-auto mb-2" />
                    <p className="text-sm text-app-text-light font-medium">Anda belum mendaftarkan alamat pengiriman.</p>
                </div>
            )}

            {/* Floating/Popup Address Form Modal */}
            {showAddModal && (
                <AddressForm
                    resetForm={() => setShowAddModal(false)}
                    handleSubmit={handleAddressSubmit}
                    form={newAddressForm}
                    setForm={setNewAddressForm}
                    editingId={null}
                    detectLocation={handleDetectLocation}
                    isDetecting={isDetecting}
                    geoError={geoError}
                />
            )}



            <button
                onClick={() => {
                    resetDetection();
                    setNewAddressForm({
                        label: "",
                        address: "",
                        city: "",
                        state: "",
                        zip: "",
                        lat: 0,
                        lng: 0,
                        isDefault: false,
                    });
                    prevDetectedRef.current = null;
                    setShowAddModal(true);
                }}
                className="w-full px-6 py-3 border border-app-green text-app-green hover:bg-app-cream rounded-xl flex-center gap-2 mb-4 font-semibold transition-colors"
            >
                Add New Address <PlusIcon className="size-4" />
            </button>

            {address.address && (
                <div className="p-4 bg-app-cream/40 border border-app-border rounded-xl mb-6">
                    <p className="text-xs font-semibold text-app-orange uppercase tracking-wider mb-1">Alamat Terpilih</p>
                    <p className="text-sm font-bold text-app-green">{address.label}</p>
                    <p className="text-sm text-zinc-700 mt-1">{address.address}, {address.city}, {address.state} {address.zip}</p>
                </div>
            )}

            <button onClick={() => { setStep("payment"); scrollTo(0, 0) }} disabled={!address.address || !address.city} className="w-full px-6 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                Continue to Payment <ChevronRightIcon className="size-4" />
            </button>
        </div>
    );
};

export default CheckoutAddress;
