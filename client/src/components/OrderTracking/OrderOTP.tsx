import { KeyRoundIcon, PackageIcon, ClockIcon, TruckIcon } from 'lucide-react'

export default function OrderOTP({ order }: { order: any }) {
    const showOtp = order.deliveryOtp && ["Assigned", "Packed", "Out for Delivery"].includes(order.status);
    
    // Case 1: Show Delivery OTP
    if (showOtp) {
        return (
            <div className="bg-linear-to-r from-app-green to-app-green-light rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-full bg-white/15 flex-center">
                        <KeyRoundIcon className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Delivery OTP</h3>
                        <p className="text-xs text-white/70">Share this with your delivery partner</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-2">
                    {order.deliveryOtp.split("").map((digit: string, i: number) => (
                        <div key={i} className="w-11 h-13 rounded-xl bg-white/15 flex-center text-2xl font-mono font-bold tracking-wider">
                            {digit}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Case 2: Delivery in progress (Assigned, Packed, Out for Delivery) without OTP (expedition)
    const isInDelivery = ["Assigned", "Packed", "Out for Delivery"].includes(order.status);
    if (isInDelivery && !showOtp) {
        return (
            <div className="bg-linear-to-r from-app-orange to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-full bg-white/15 flex-center">
                        <TruckIcon className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Pesanan Sedang Dikirim</h3>
                        <p className="text-xs text-white/70">Status: {order.status}</p>
                    </div>
                </div>
                <div className="bg-white/15 rounded-xl p-4 mt-2 space-y-2">
                    <p className="text-sm flex items-center gap-2">
                        <TruckIcon className="size-4 shrink-0" />
                        Pesanan kamu sedang dalam perjalanan menggunakan kurir ekspedisi
                    </p>
                    <p className="text-sm flex items-center gap-2">
                        <ClockIcon className="size-4 shrink-0" />
                        Estimasi sampai: <strong>3-5 hari kerja</strong>
                    </p>
                </div>
            </div>
        )
    }

    // Case 3: Early status (Placed, Confirmed) - showing processing message
    if (order.status && order.status !== "Delivered" && order.status !== "Cancelled" && !isInDelivery) {
        return (
            <div className="bg-linear-to-r from-app-green to-app-green-light rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-full bg-white/15 flex-center">
                        <PackageIcon className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Pesanan Sedang Diproses</h3>
                        <p className="text-xs text-white/70">Mohon ditunggu ya</p>
                    </div>
                </div>
                <div className="bg-white/15 rounded-xl p-4 mt-2">
                    <p className="text-sm flex items-center gap-2">
                        <ClockIcon className="size-4 shrink-0" />
                        Pesanan kamu sedang kami proses, kami akan segera mengirimkannya~
                    </p>
                </div>
            </div>
        )
    }

    return null;
}
