import { LoaderIcon, MapPinIcon, XIcon } from "lucide-react"
import AddressAutocomplete from "./AddressAutocomplete"

interface AddressFormProps {
    resetForm: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    form: {
        label: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        lat?: number;
        lng?: number;
        isDefault: boolean;
    };
    setForm: (form: any) => void;
    editingId: string | null;
    detectLocation?: () => void;
    isDetecting?: boolean;
    geoError?: string | null;
}

const AddressForm = ({ resetForm, handleSubmit, form, setForm, editingId, detectLocation, isDetecting, geoError }: AddressFormProps) => {
    const handleAddressSelect = (result: { address: string; city: string; state: string; zip: string; lat: number; lng: number }) => {
        setForm({
            ...form,
            address: result.address,
            city: result.city,
            state: result.state,
            zip: result.zip,
            lat: result.lat,
            lng: result.lng,
        });
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 z-50" />

            {/* Form Container */}
            <div onClick={resetForm} className="fixed inset-0 z-50 flex-center p-4">
                <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
                    {/* Form header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-app-green">{editingId ? "Edit Address" : "Add New Address"}</h2>
                        <button type="button" onClick={resetForm} className="p-2 hover:bg-app-cream rounded-lg">
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    {/* Detect Location Button */}
                    {!editingId && detectLocation && (
                        <button
                            type="button"
                            onClick={detectLocation}
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
                    )}

                    {/* Geo Error Message */}
                    {geoError && (
                        <p className="text-xs text-red-500 mb-3 text-center bg-red-50 p-2 rounded-lg">{geoError}</p>
                    )}

                    {/* Form Input Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5" htmlFor="">Label</label>
                            <input type="text" placeholder="Home, Work, etc." required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                        </div>
                        <div>
                            <AddressAutocomplete
                                value={form.address}
                                label="Street Address"
                                placeholder="Cari nama jalan atau alamat..."
                                required
                                onSelect={handleAddressSelect}
                                onChange={(val) => setForm({ ...form, address: val })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5" htmlFor="">City</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5" htmlFor="">State</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5" htmlFor="">ZIP Code</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer" htmlFor="">
                                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                                    <span className="text-sm text-app-text">Set as default </span>
                                </label>

                            </div>
                        </div>

                    </div>

                    {/* Submit */}
                    <button type="submit" className="mt-6 w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors">
                        {editingId ? "Update Address" : "Save Address"}
                    </button>
                </form >
            </div >
        </>
    )
}

export default AddressForm
