import { useEffect, useRef } from 'react';
import { ChevronRightIcon, LoaderIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useGeolocation from '../../hooks/useGeolocation';
import AddressAutocomplete from '../AddressAutocomplete';

const CheckoutAddress = ({ user, address, setAddress, setStep }: any) => {
    const { detectedAddress, isDetecting, error: geoError, detectLocation } = useGeolocation();
    const prevDetectedRef = useRef<any>(null);

    const handleDetectLocation = async () => {
        detectLocation();
    };

    const handleAddressSelect = (result: { address: string; city: string; state: string; zip: string; lat: number; lng: number }) => {
        setAddress((prev: any) => ({
            ...prev,
            address: result.address,
            city: result.city,
            state: result.state,
            zip: result.zip,
            lat: result.lat,
            lng: result.lng,
        }));
    };

    // When geolocation returns an address, pre-fill the checkout address
    useEffect(() => {
        if (detectedAddress && detectedAddress !== prevDetectedRef.current) {
            prevDetectedRef.current = detectedAddress;
            setAddress((prev: any) => ({
                ...prev,
                label: "Home",
                address: detectedAddress.address || prev.address,
                city: detectedAddress.city || prev.city,
                state: detectedAddress.state || prev.state,
                zip: detectedAddress.zip || prev.zip,
                lat: detectedAddress.lat,
                lng: detectedAddress.lng,
            }));
        }
    }, [detectedAddress, setAddress]);

    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in">
            <h2 className="text-lg font-semibold text-app-green mb-5 flex items-center gap-2">
                <MapPinIcon className="size-5" /> Delivery Address
            </h2>

            {/* Detect Location Button */}
            <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full mb-4 py-2.5 border-2 border-dashed border-app-green text-app-green text-sm font-semibold rounded-xl hover:bg-app-cream transition-colors flex-center gap-2 disabled:opacity-50"
            >
                {isDetecting ? (
                    <>
                        <LoaderIcon className="size-4 animate-spin" />
                        Detecting your location...
                    </>
                ) : (
                    <>
                        <MapPinIcon className="size-4" />
                        Detect My Location
                    </>
                )}
            </button>

            {/* Geo Error Message */}
            {geoError && (
                <p className="text-xs text-red-500 mb-3 text-center bg-red-50 p-2 rounded-lg">{geoError}</p>
            )}

            {/* Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-app-green mb-3">Saved Addresses</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {user.addresses.map((addr: any) => (
                            <div
                                key={addr.id || addr.label}
                                onClick={() => setAddress({
                                    label: addr.label,
                                    address: addr.address,
                                    city: addr.city,
                                    state: addr.state,
                                    zip: addr.zip,
                                    lat: addr.lat,
                                    lng: addr.lng,
                                })}
                                className={`p-4 rounded-xl border cursor-pointer transition-colors ${address.label === addr.label && address.address === addr.address ? 'border-app-green bg-app-cream' : 'border-app-border hover:bg-app-cream'}`}
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
            )}

            {/* Manual Address Fields */}
            <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-app-green mb-3">Or enter address manually</h3>
                <div>
                    <label className="block text-xs font-medium text-app-green mb-1">Label</label>
                    <input
                        type="text"
                        placeholder="Home, Work, etc."
                        value={address.label}
                        onChange={(e) => setAddress((prev: any) => ({ ...prev, label: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                    />
                </div>
                <div>
                    <AddressAutocomplete
                        value={address.address}
                        label="Street Address"
                        placeholder="Cari nama jalan atau alamat..."
                        required
                        onSelect={handleAddressSelect}
                        onChange={(val) => setAddress((prev: any) => ({ ...prev, address: val }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-app-green mb-1">City</label>
                        <input
                            type="text"
                            required
                            value={address.city}
                            onChange={(e) => setAddress((prev: any) => ({ ...prev, city: e.target.value }))}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-app-green mb-1">State</label>
                        <input
                            type="text"
                            required
                            value={address.state}
                            onChange={(e) => setAddress((prev: any) => ({ ...prev, state: e.target.value }))}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-app-green mb-1">ZIP Code</label>
                    <input
                        type="text"
                        required
                        value={address.zip}
                        onChange={(e) => setAddress((prev: any) => ({ ...prev, zip: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                    />
                </div>
            </div>

            <Link to="/addresses" className="w-full px-6 py-3 border border-gray-600 text-gray-600 rounded-xl flex-center gap-2 mb-3">
                Add New Address <PlusIcon className="size-4" />
            </Link>
            <button onClick={() => { setStep("payment"); scrollTo(0, 0) }} disabled={!address.address || !address.city} className="w-full px-6 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-50 flex items-center gap-2">
                Continue to Payment <ChevronRightIcon className="size-4" />
            </button>
        </div>
    )
}

export default CheckoutAddress
