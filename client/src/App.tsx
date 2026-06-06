import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import { usePWAUpdate } from './hooks/usePWAUpdate'
import Login from './pages/Login'
import AppLayout from './pages/AppLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductPage from './pages/ProductPage'
import SearchResults from './pages/SearchResults'
import FlashDeals from './pages/FlashDeals'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import OrderTracking from './pages/OrderTracking'
import Addresses from './pages/Addresses'
import Wishlist from './pages/Wishlist'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminDeliveryPartners from './pages/admin/AdminDeliveryPartners'
import DeliveryLogin from './pages/delivery/DeliveryLogin'
import DeliveryLayout from './pages/delivery/DeliveryLayout'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'
const PWAUpdateBanner = () => {
  const { needRefresh, updateServiceWorker } = usePWAUpdate();

  if (!needRefresh || !updateServiceWorker) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] bg-white border border-green-200 rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-slide-up">
      <div className="shrink-0 size-10 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900">Update Available</p>
        <p className="text-xs text-zinc-500 mt-0.5">A new version of GroceShop is ready.</p>
      </div>
      <button
        onClick={updateServiceWorker}
        className="shrink-0 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
      >
        Update
      </button>
    </div>
  );
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3000, style: {
          background: "#1B3022",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px"
        }
      }} />

      <PWAUpdateBanner />

      <Routes>
        {/* Auth Pages - No Navbar / Footer */}
        <Route path='/login' element={<Login />} />
        {/* Main Pages - With Navbar / Footer */}
        <Route path='/' element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path='products' element={<Products />} />
          <Route path='products/:id' element={<ProductPage />} />
          <Route path='search' element={<SearchResults />} />
          <Route path='deals' element={<FlashDeals />} />
          <Route element={<ProtectedRoute />}>
            <Route path='checkout' element={<Checkout />} />
            <Route path='orders' element={<MyOrders />} />
            <Route path='orders/:id' element={<OrderTracking />} />
            <Route path='addresses' element={<Addresses />} />
            <Route path='wishlist' element={<Wishlist />} />
          </Route>
        </Route>

        {/* Admin Pages */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='products' element={<AdminProducts />} />
          <Route path='products/new' element={<AdminProductForm />} />
          <Route path='products/:id/edit' element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path='delivery-partners' element={<AdminDeliveryPartners />} />
        </Route>

        {/* Delivery Partner Pages */}
        <Route path='/delivery/login' element={<DeliveryLogin />} />
        <Route path='/delivery' element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboard />} />
        </Route>
      </Routes>

    </>
  )
}

export default App