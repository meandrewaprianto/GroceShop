import { Outlet } from "react-router-dom"
import Banner from "../components/Banner"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CartSidebar from "../components/CartSidebar"
import InstallPWA from "../components/InstallPWA"

const AppLayout = () => {
    return (
        <>
            <Banner />
            <Navbar />
            <main className="min-h-screen">
                <Outlet />
            </main>
            <Footer />
            <CartSidebar />
            <InstallPWA />
        </>
    )
}

export default AppLayout
