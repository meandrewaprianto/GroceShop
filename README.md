# 🛒 GroceShop - E-Commerce Grocery Application

GroceShop adalah aplikasi e-commerce belanja bahan makanan (grocery) modern, premium, dan dinamis yang dibangun menggunakan stack teknologi modern: **React**, **TypeScript**, **Vite**, dan **Tailwind CSS v4**.

Aplikasi ini didesain dengan estetika berkelas menggunakan palet warna natural (Forest Green & Orange Accent), tipografi premium, serta animasi mikro interaktif untuk memberikan pengalaman pengguna yang luar biasa.

---

## 🌟 Portfolio Note

Proyek ini awalnya terinspirasi dari tutorial e-commerce dari channel YouTube **GreatStack**. Namun, aplikasi ini telah dikembangkan lebih jauh (extend & upgrade) secara masif dengan menambahkan berbagai fitur kustom dan penyempurnaan UI/UX yang tidak ada dalam tutorial aslinya. Proyek ini berfungsi sebagai *showcase* kemampuan pengembangan antarmuka React secara komprehensif.

**✨ Fitur Ekstra Kustom (Beyond the Tutorial):**
- **Sistem Filter Dinamis (URL-Driven):** Filter berlapis (Kategori, Organik, Rentang Harga, Sorting) dengan state persisten pada URL tanpa menggunakan package eksternal, memudahkan pengguna untuk membagikan tautan (shareable links) pencarian.
- **Validasi Rentang Harga Tingkat Lanjut:** Komponen `FilterPanel` dilengkapi penanganan khusus untuk validasi input harga secara interaktif (mencegah angka negatif dan secara otomatis menyinkronkan batas minimum-maksimum saat kehilangan fokus / *onBlur*, menjaga kenyamanan UX saat pengguna mengetik).
- **Algoritma Flash Deals & Pagination Cerdas:** Halaman promo khusus Flash Deals difilter secara algoritmik (hanya menampilkan produk `stock > 0` dan `discount >= 10%`). Sistem aplikasi ini juga telah dilengkapi mekanisme *client-side pagination* reaktif (`Products.tsx` & `FlashDeals.tsx`) yang beradaptasi secara real-time terhadap panjang data yang tersaji.
- **Sistem Keranjang Reaktif & Drawer Modal:** Logika keranjang global (*Context*) yang mengimplementasikan UX mutakhir: pembaruan kuantitas produk secara dua-arah (*two-way synchronization*), di mana penambahan/pengurangan item pada layar secara instan masuk ke dalam keranjang, dan penghapusan item otomatis menyetel ulang form kuantitas ke default (`1`). Serta integrasi filter menggunakan *drawer* animasi mulus.
- **Desain UI/UX Premium (Tailwind v4):** Mengubah desain dasar dengan palet warna terstruktur (Forest Green & Orange Accent), tipografi modern (DM Serif Display & Outfit), serta implementasi mikro-animasi pada komponen.

---

## 🗺️ Project Roadmap & Progress Tracker

Berikut adalah peta jalan (roadmap) dan status pengerjaan proyek GroceShop:

### Phase 1: Inisialisasi & Fondasi Sistem 🟢 (COMPLETED)
- [x] Inisialisasi proyek menggunakan Vite + React + TypeScript.
- [x] Konfigurasi Tailwind CSS v4 menggunakan `@tailwindcss/vite` untuk build super cepat.
- [x] Pembuatan sistem desain (custom theme) di `index.css` (Warna, Tipografi, Scrollbar kustom, & Utility Classes).
- [x] Instalasi library inti yang dibutuhkan proyek:
  - `react-router-dom` (Sistem navigasi)
  - `react-hot-toast` (Notifikasi interaktif)
  - `lucide-react` & `@icons-pack/react-simple-icons` (Paket icon modern)
  - `leaflet`, `react-leaflet`, dan `@types/leaflet` (Peta interaktif & deklarasi tipe data untuk alamat & pelacakan kurir)
- [x] Pendefinisian data modeling & TypeScript Interfaces komprehensif di `src/types/index.ts`.

### Phase 2: Arsitektur Halaman & Routing 🟢 (COMPLETED)
- [x] Pembuatan layout dasar aplikasi (`AppLayout.tsx`) sebagai kerangka visual global.
- [x] Pembuatan 10+ modul halaman utama (Home, Login, Products, ProductPage, FlashDeals, SearchResults, Checkout, Addresses, MyOrders, OrderTracking).
- [x] Konfigurasi `<BrowserRouter>` di `main.tsx` untuk membungkus seluruh aplikasi.
- [x] Implementasi sistem routing terstruktur di `App.tsx` menggunakan `react-router-dom`:
  - **Rute Publik:** `/` (Home), `/products` (Katalog), `/products/:id` (Detail), `/search` (Hasil pencarian), `/deals` (Flash Deals), dan `/login` (Autentikasi).
  - **Rute Terproteksi:** `/checkout` (Pembayaran), `/orders` (Riwayat belanja), `/orders/:id` (Pelacakan), dan `/addresses` (Buku alamat).
  - **Rute Admin Panel** (`/admin`): Dashboard, Products (CRUD), Orders, dan Delivery Partners — dibungkus dalam `AdminLayout` dengan sidebar navigasi khusus administrator.
  - **Rute Delivery Partner** (`/delivery`): Login khusus kurir (`/delivery/login`) dan Dashboard kurir (`/delivery`) — dibungkus dalam `DeliveryLayout` terpisah dari layout utama pelanggan.
- [x] Pembuatan komponen `ProtectedRoute.tsx` (Route Guard) di `src/components/` untuk melindungi halaman khusus pengguna terautentikasi.
- [x] Integrasi sistem notifikasi global menggunakan `<Toaster>` dari `react-hot-toast` dengan styling kustom premium bernuansa warna hijau brand (`#1B3022`).
- [x] Penstrukturan visual pada `AppLayout.tsx` (Banner, Navbar, Main area dengan `<Outlet />`, Footer, dan Cart Sidebar).
- [x] **Implementasi Halaman Login & Registrasi (`Login.tsx`):**
  - Desain premium split-screen responsif (Kiri: Branding visual artistik dengan gambar hero bermotif hijau brand; Kanan: Formulir dinamis).
  - Pilihan multi-state interaktif yang mulus untuk beralih antara "Sign In" dan "Sign Up".
  - Integrasi ikon modern (`UserIcon`, `MailIcon`, `LockIcon`) di dalam form input dengan validasi state React.
  - Animasi pemuatan dinamis (`Loader2Icon` spinner) pada tombol kirim saat status loading aktif.
  - Simulasi alur autentikasi dengan penundaan 1 detik sebelum dialihkan secara otomatis ke Beranda (`/`).


### Phase 3: Pembangunan Komponen UI & Layouting 🟡 (IN PROGRESS)
- [x] **Banner Promosi (`Banner.tsx`):**
  - Desain premium gradasi gradien linier kustom (`bg-linear-to-r` dari Tailwind CSS v4) yang memadukan warna hijau brand (`from-app-green` ke `emerald-800` ke `to-app-green`).
  - Menampilkan informasi pengiriman gratis dan jaminan sayuran segar harian secara responsif (menyembunyikan detail sekunder pada layar kecil).
  - Mekanisme tombol tutup (`XIcon`) yang menyimpan status preferensi ke `sessionStorage` agar banner tetap tersembunyi selama sesi berlangsung.
  - Integrasi langsung ke kerangka tata letak global `AppLayout.tsx`.
- [x] **Navigasi Global (`Navbar.tsx`):**
  - Antarmuka navigasi lengket (*sticky header*) yang responsif dengan efek pembatas (`border-b`) premium.
  - Bar pencarian terintegrasi bergaya modern (`bg-orange-50` & ring focus) untuk pencarian grocery terarah ke halaman `/search?q=query`.
  - Ikon keranjang melayang dengan indikator jumlah item (`cartCount`) bergaya lencana oranye bulat (`bg-app-orange`).
  - Menu pengguna dinamis dengan dropdown interaktif yang didukung animasi halus (`animate-fade-in`), menyediakan pintasan rute: Sign In (jika belum masuk), Profil/Nama & Email, My Orders, Addresses, Admin Panel (khusus administrator), dan Logout.
  - Penanganan menu seluler pintar (`MenuIcon`/`XIcon`) yang mengintegrasikan tautan navigasi tambahan pada ukuran layar kecil.
  - **Integrasi Cart:** `cartCount` dan `setIsCartOpen` kini menggunakan hook `useCart()` nyata (sebelumnya stub statis).
  - Terintegrasi langsung ke dalam kerangka global `AppLayout.tsx`.
- [x] **Antarmuka Halaman Utama / Home Components (`src/components/Home/`):**
  - **Seksi Hero Utama (`Hero.tsx`):** Desain spanduk selamat datang premium dengan gambar latar tertutup penuh (`object-cover`), overlay gradasi gelap hijau ke transparan (`bg-linear-to-r` dari `app-green` ke `transparent` menggunakan Tailwind CSS v4), lencana sayuran segar organik dengan `LeafIcon`, tipografi serif yang menawan, paragraf deskripsi dinamis, dan tombol aksi (Shop Now & Browse Categories).
  - **Seksi Fitur Utama (`Features.tsx`):** Implementasi grid responsif (`grid grid-cols-2 md:grid-cols-4 gap-4`) dinamis yang merender list pilar layanan unggulan dari data `heroSectionData.hero_features`, lengkap dengan ikon bergaya kustom berlatar belakang krim (`bg-app-cream`), teks tebal hijau brand, serta deskripsi penjelas abu-abu lembut.
  - **Kategori Produk Slider (`HomeCategories.tsx`):** Slider navigasi kategori horizontal yang mendukung scroll tanpa bar (`no-scrollbar`), efek hover ring pada gambar kategori (`group-hover:ring-2 ring-orange-300`), dan navigasi otomatis ke katalog `/products?category=slug` lengkap dengan pemosisian ulang scroll otomatis (`window.scrollTo(0, 0)`).
  - **Grid Produk Terpopuler (`PopularProducts.tsx`):** Seksi dinamis yang merender daftar 10 produk terpopuler musim ini secara dinamis (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`) bersumber dari data `dummyProducts`, lengkap dengan judul seksi, deskripsi singkat, dan tombol "View All" berikon `ArrowRightIcon` menuju katalog lengkap. **Bug fix:** `useEffect` ditambah dependency array `[]` untuk mencegah infinite re-render.
  - **Banner Promo Unduh Aplikasi (`AppPromoBanner.tsx`):** Seksi promosi bergaya gelap (`bg-green-950`) berbentuk kartu rounded dengan tata letak dua kolom responsif — sisi kiri menampilkan judul serif premium, deskripsi, dan tombol unduh (App Store & Google Play); sisi kanan menampilkan ilustrasi truk pengiriman (`delivery_truck`).
  - **Formulir Newsletter (`NewsLetter.tsx`):** Seksi berlangganan newsletter bersih bergaya kartu putih (`bg-white rounded-3xl shadow-xs`) dengan ikon amplop brand, judul, deskripsi singkat, dan formulir email inline (input + tombol Subscribe) yang responsif di perangkat kecil maupun besar.
  - **Integrasi Halaman Utama (`Home.tsx`):** Menggabungkan komponen `<Hero />`, `<Features />`, `<HomeCategories />`, `<PopularProducts />`, `<AppPromoBanner />`, dan `<NewsLetter />` secara berurutan dalam tata letak responsif beranda.
- [x] **Footer Global (`Footer.tsx`):** Footer premium berlatar hijau brand (`bg-app-green`) dengan tata letak grid empat kolom responsif (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) yang memuat: seksi brand (logo `BikeIcon`, deskripsi, ikon sosial media Facebook/X/Instagram dari `@icons-pack/react-simple-icons`), dua kolom tautan dinamis (Quick Links & Customer Service), kolom kontak (alamat, telepon, email dengan ikon), serta baris bawah (`border-t`) yang menampilkan copyright dan tautan kebijakan privasi. Seluruh konten bersumber dari objek `footerData` di `assets.ts`. Sudah terintegrasi penuh ke `AppLayout.tsx` menggantikan placeholder sebelumnya.
- [x] **CartSidebar (`CartSidebar.tsx`):** Implementasi penuh sidebar keranjang belanja. Fitur yang tersedia:
  - **Visibilitas Reaktif:** Render bersyarat (`if (!isCartOpen) return null`) dikontrol oleh `isCartOpen` dari `CartContext`.
  - **Overlay:** Latar gelap `bg-black/40` yang dapat diklik untuk menutup sidebar.
  - **Panel Animasi:** Drawer `fixed right-0` dengan animasi masuk `animate-slide-in-right` dan lebar maksimal `max-w-md`.
  - **Header:** Judul "Your Cart" dengan ikon `ShoppingBagIcon`, badge jumlah item, dan tombol tutup `XIcon`.
  - **Daftar Item:** Scroll-area yang merender setiap `CartItem` dalam kartu `bg-app-cream/60` — menampilkan gambar, nama, harga/unit, kontrol quantity (`MinusIcon`/`PlusIcon`), total per item, dan tombol hapus (`Trash2Icon`).
  - **Empty State:** Tampilan khusus (`ShoppingBagIcon` besar + pesan) ketika keranjang kosong.
  - **Footer Ringkasan:** Ditampilkan saat ada item — menampilkan subtotal, biaya pengiriman (gratis jika order ≥ $20, `$1.99` jika di bawah), grand total, dan tombol "Proceed to Checkout" (`bg-app-orange`) yang menavigasi ke `/checkout`.
  - **Integrasi Context:** Mengonsumsi `useCart()` untuk `items`, `updateQuantity`, `removeFromCart`, `cartTotal`, `isCartOpen`, `setIsCartOpen`; dan `useNavigate` untuk redirect checkout.
- [x] **Komponen UI Reusable:**
  - **Kartu Produk Kustom (`ProductCard.tsx`):** Kartu belanja visual premium dengan transisi bayangan hover (`shadow hover:shadow-md transition-all`), efek perbesaran gambar dinamis pada hover (`group-hover:p-2 transition-all`), lencana diskon (`discount% OFF`), penilai skor bintang (`StarIcon`), pemisah harga asli kustom (`originalPrice` vs `price` dengan coretan `line-through`), tombol tambah keranjang (`Plus` icon) dengan efek klik aktif, penanganan stop perambatan navigasi (`e.stopPropagation()`), dan perutean dinamis menuju detail produk `/products/:id` saat kartu diklik. **Integrasi Cart:** `addToCart` kini menggunakan hook `useCart()` nyata (menggantikan stub kosong sebelumnya).
  - `CategoryList.tsx` (Navigasi kategori horizontal bergaya rounded).
  - `Button.tsx` (Tombol kustom dengan efek ripple/mikro-animasi).
  - `SectionHeader.tsx` (Header seksi konten dengan countdown timer untuk Flash Deals).
- [x] **Halaman Riwayat Pesanan (`MyOrders.tsx`):** Implementasi penuh halaman riwayat pesanan pengguna. Fitur yang tersedia:
  - **Filter Tab Dinamis:** Navigasi tab (`All`, `Placed`, `Out of Delivery`, `Delivered`) untuk menyaring pesanan berdasarkan status.
  - **Kartu Pesanan Informatif:** Setiap kartu menampilkan ID Order (8 karakter terakhir), tanggal, badge status berwarna, thumbnail produk (maks. 4 item), serta ringkasan jumlah item dan total harga.
  - **Item Thumbnails dengan Modal Interaktif:** Thumbnail produk dibatasi maksimal 4 gambar. Jika pesanan memiliki lebih dari 4 item, sebuah chip `+N` tampil sebagai indikator. Seluruh area thumbnail (termasuk chip) berfungsi sebagai zona klik terpisah yang membuka **Overlay Modal** tanpa mengaktifkan navigasi ke halaman tracking. Teknik `e.stopPropagation()` pada `div` wrapper thumbnail memisahkan aksi *buka modal* dari *navigasi ke OrderTracking*.
  - **Overlay Modal Detail Pesanan:** Modal terpusat dengan animasi `animate-fade-in` menampilkan daftar lengkap semua item yang dibeli — gambar produk, nama, dan kuantitas (`qty x unit`). Footer modal dilengkapi `border-t` yang merangkum total keseluruhan kuantitas item. Modal dapat ditutup via tombol `XIcon` atau klik overlay transparan di luar modal.
  - **Ringkasan Kartu (Border Top):** Bagian bawah setiap kartu pesanan (di luar modal) menampilkan ringkasan total item dan grand total harga (subtotal + delivery fee) yang dipisahkan oleh garis `border-t border-app-border`.
  - **Tombol Track Order:** Setiap kartu memiliki tombol navigasi langsung menuju halaman `OrderTracking` (`/orders/:id`) yang terpisah dari area klik thumbnail.
  - **Empty State & Loading:** Tampilan khusus saat tidak ada order, dan komponen `Loading` saat data sedang diambil.
- [x] **Halaman Katalog Produk (`Products.tsx`):** Implementasi penuh halaman katalog grocery yang digerakkan oleh URL (`useSearchParams`). Fitur yang tersedia:
  - **Filter URL-driven:** Parameter `category`, `organic`, `sort`, `page`, `minPrice`, `maxPrice` dibaca dari URL dan diubah via `updateFilter()` / `clearFilters()` tanpa reload halaman.
  - **Breadcrumb:** Navigasi kontekstual `Home → Nama Kategori / All Products` menggunakan `HomeIcon` dan `Link` dari react-router-dom.
  - **Sidebar Filter (Desktop) & Filter Panel (`FilterPanel.tsx`):** Panel filter komprehensif (`bg-white rounded-2xl` `sticky top-24`) dengan dukungan kategori, toggle produk organik, dan filter rentang harga. Memiliki sistem validasi input kustom (`onBlur`) untuk memastikan integritas data (mencegah `minPrice` melampaui `maxPrice` dan tidak menerima nilai negatif) tanpa mengganggu UX saat pengetikan.
  - **Header Konten:** Menampilkan nama kategori aktif (`activateCategory.name` atau "All Products"), jumlah produk ditemukan (`totalFilteredCount`), tombol filter mobile interaktif (`SlidersHorizontal` memicu animasi *slide-in-up* modal), dan dropdown sort (Newest / Price Low-High / Price High-Low / Top Rated / A-Z).
  - **Grid Produk:** Layout responsif `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` yang merender `ProductCard` untuk setiap produk dengan `stock > 0`.
  - **State Loading & Empty:** Loading placeholder dan empty state interaktif dengan pesan dan tombol "Clear Filters".
  - **Pagination Dinamis:** Komponen pagination angka reaktif yang secara cerdas menghitung ulang dan menampilkan `totalPages` berdasarkan jumlah produk yang telah melewati semua filter aktif. Menampilkan highlight pada halaman yang sedang dibuka dan didukung navigasi *scroll-to-top* otomatis.
  - **Integrasi Data:** Saat ini menggunakan data mock lokal (`dummyProducts` dan `categoriesData` dari `assets.ts`); dirancang agar mudah diganti menjadi koneksi data API nyata (production ready).
- [x] **Halaman Flash Deals (`FlashDeals.tsx`):**
  - **Filter Algoritmik Eksklusif:** Mengimplementasikan logika yang secara dinamis menyaring produk dari katalog untuk hanya menampilkan barang dengan persediaan (`stock > 0`) dan tingkat potongan harga yang valid / signifikan (`discount >= 10%`).
  - **Client-Side Pagination Terintegrasi:** Menambahkan dukungan sistem *pagination* (10 produk per halaman, didorong oleh parameter URL) untuk menavigasi etalase penawaran dengan bersih tanpa pemuatan vertikal tiada akhir.
- [x] **Halaman Detail Produk (`ProductPage.tsx`):**
  - **Sinkronisasi State Kuantitas Cerdas:** Menerapkan logika reaktif di mana menekan tombol 'Plus' pada produk yang belum ada di keranjang akan langsung mendaftarkan dan menjumlahkan item tersebut tanpa mengharuskan pengguna menekan tombol "Add to Cart" secara manual lagi.
  - **Penyetelan Ulang Otomatis (Auto-Reset):** Saat pengguna mengurangi kuantitas dengan tombol 'Minus' hingga item sepenuhnya terhapus dari keranjang, status nilai input sementara (`localQuantity`) akan otomatis direset menjadi nilai asalnya (`1`).
  - **Rekomendasi Produk Cerdas:** Menampilkan seksi 'Related Products' secara dinamis dengan mengimplementasikan filter relasional berbasis kesamaan kategori (*category-matching*). Algoritma dengan pintar mengecualikan produk yang sedang aktif, dan membatasi rekomendasi maksimal hingga 5 item.
- [x] **Halaman Pelacakan Pesanan (`OrderTracking.tsx`):** Implementasi penuh halaman real-time order tracking. Fitur yang tersedia:
  - **Header Dinamis:** Menampilkan Order ID (8 karakter terakhir), tanggal pembuatan, dan badge status pesanan dengan warna berbeda (hijau/merah/oranye).
  - **Integrasi Komponen Khusus (`src/components/OrderTracking/`):** Halaman ini merakit tiga sub-komponen modular: `<OrderOTP />` (kartu kode verifikasi serah terima), `<LiveMap />` (peta interaktif Leaflet), dan `<OrderTimeLine />` (riwayat progres status pesanan).
  - **Kartu Delivery Partner:** Menampilkan avatar inisial nama, nama kurir, dan tipe kendaraan. Dilengkapi tombol **Telepon Langsung** (`<a href="tel:...">`) yang membuka aplikasi telepon secara langsung saat ditekan.
  - **Kolom Kanan — Delivery Address:** Kartu alamat pengiriman lengkap dengan label, jalan, kota, provinsi, dan kode pos.
  - **Kolom Kanan — Item & Ringkasan Harga:** Daftar semua barang yang dipesan dengan gambar, nama, kuantitas, dan harga per item. Diikuti ringkasan biaya dengan `border-t` yang memuat Subtotal, Delivery Fee (gratis atau berbayar), Pajak (Tax), dan Grand Total.
  - **Perbaikan Z-Index (`LiveMap.tsx`):** Wrapper peta diberi kelas `relative z-0` untuk menciptakan *stacking context* baru, mencegah layer internal Leaflet (z-index ~400) dari menembus dan menimpa `Navbar` (z-50).
  - **Layout Responsif 2-Kolom:** Menggunakan grid `lg:grid-cols-3` — sisi kiri (`lg:col-span-2`) untuk peta dan timeline, sisi kanan untuk detail pesanan.
- [x] **Halaman Hasil Pencarian (`SearchResults.tsx`):** Implementasi penuh halaman hasil pencarian produk. Fitur yang tersedia:
  - **Filter Real-Time:** Menggunakan `useSearchParams` untuk membaca parameter `?q=` dari URL. Setiap perubahan query secara reaktif memfilter `dummyProducts` berdasarkan kecocokan nama produk (`name.toLowerCase().includes(query)`).
  - **Breadcrumb:** Navigasi `Home / Search Results` menggunakan ikon `HomeIcon` dan `Link`.
  - **Header Dinamis:** Menampilkan teks `Results for "[query]"` dan jumlah item yang ditemukan, dengan status `"Searching..."` saat loading aktif.
  - **Grid Produk:** Layout responsif `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` menggunakan komponen `<ProductCard />`.
  - **Empty State:** Tampilan khusus saat tidak ada produk yang cocok, dengan ikon besar, pesan deskriptif, dan tombol "Browse All Products".
- [x] **Halaman Buku Alamat (`Addresses.tsx`) & Komponen Pendukung:** Implementasi penuh halaman manajemen alamat. Fitur yang tersedia:
  - **State Manajemen:** Menyimpan `addresses`, `loading`, `showForm`, `editingId`, dan object `form` (label, address, city, state, zip, isDefault).
  - **Fungsi `onEditHandler`:** Mengisi ulang state `form` dengan data alamat yang diklik, lalu menampilkan modal form dalam mode edit.
  - **Fungsi `resetForm`:** Mengosongkan semua state form dan menyembunyikan modal, baik setelah submit maupun saat pengguna menutup modal.
  - **Empty State & Loading:** Tampilan khusus saat daftar kosong (`MapPinIcon`) dan komponen `<Loading />` selama pengambilan data.
  - **`AddressCard.tsx` (Komponen Baru):** Kartu alamat reusable yang menampilkan ikon pin, label alamat, badge "Default" (`CheckIcon`), serta dua tombol aksi — Edit (`PencilIcon`) yang memanggil `onEditHandler`, dan Delete (`Trash2Icon`) yang memanggil `handleDelete`.
  - **`AddressForm.tsx` (Komponen Baru):** Modal form overlay (`fixed inset-0 z-50`) dengan animasi `animate-fade-in` untuk menambah atau mengedit alamat. Input field mencakup: Label, Street Address, City, State, ZIP Code, dan checkbox "Set as default". Header modal berubah secara dinamis antara "Add New Address" dan "Edit Address" berdasarkan state `editingId`. Modal dapat ditutup via tombol `XIcon` atau klik overlay.
- [x] **Halaman Checkout Multi-Step (`Checkout.tsx`) & Komponen Pendukung:** Implementasi penuh halaman pembayaran dengan alur 3 langkah. Fitur yang tersedia:
  - **Navigasi Step:** Tiga tombol langkah (`Address` → `Payment` → `Review`) dengan indikator aktif (`bg-app-green text-white`) dan ikon masing-masing (`MapPinIcon`, `CreditCardIcon`, `CheckIcon`).
  - **Kalkulasi Harga Real-Time:** `deliveryFee` dihitung otomatis (gratis jika subtotal ≥ $20, `$1.99` jika kurang). `tax` dihitung sebesar 8% dari subtotal. `total` adalah penjumlahan ketiganya.
  - **Pre-fill Alamat Default:** `useState` digunakan untuk mengisi state `address` dengan alamat default (`isDefault: true`) dari data pengguna saat komponen pertama kali di-render.
  - **Empty Cart Guard:** Jika `items.length === 0`, halaman langsung menampilkan halaman kosong dengan tombol "Browse Products" (tidak ada akses langsung ke form checkout).
  - **Sidebar Order Summary (Sticky):** Panel ringkasan pesanan `sticky top-24` di kolom kanan, menampilkan Subtotal, Delivery, Tax, dan Grand Total secara real-time.
  - **`CheckoutAddress.tsx`:** Sub-komponen step 1 untuk memilih atau mengisi alamat pengiriman.
  - **`CheckoutPayment.tsx`:** Sub-komponen step 2 untuk memilih metode pembayaran (card/cash).
  - **`CheckoutReview.tsx`:** Sub-komponen step 3 untuk merangkum dan mengkonfirmasi pesanan sebelum ditempatkan.
- [ ] **Komponen Peta & Geocoding:** Integrasi Leaflet di `Addresses.tsx` untuk menentukan pin lokasi pengantaran baru.

### Phase 4: Manajemen State & Aliran Data (State Management) 🟡 (IN PROGRESS)
- [ ] **Auth Context:** Menyimpan data sesi login user (`User` interface).
- [x] **Cart Context (`CartContext.tsx`):** Implementasi penuh menggunakan `createContext` + `useState` + `useEffect`. Fitur yang tersedia:
  - `addToCart(product, quantity?)` — menambahkan produk ke keranjang; jika sudah ada, quantity di-increment. Sidebar otomatis terbuka setiap kali item ditambahkan.
  - `removeFromCart(productId)` — menghapus item dari keranjang.
  - `updateQuantity(productId, quantity)` — mengubah jumlah item; jika quantity ≤ 0, item dihapus otomatis.
  - `clearCart()` — mengosongkan seluruh keranjang dan menutup sidebar.
  - `cartCount` & `cartTotal` — nilai turunan reaktif (derived state) untuk jumlah item dan total harga.
  - `isCartOpen` / `setIsCartOpen` — kontrol visibilitas CartSidebar.
  - **Persistensi:** State keranjang disimpan ke `localStorage` (`app_cart`) via `useEffect` sehingga keranjang bertahan saat refresh.
  - **Integrasi Global:** `CartProvider` membungkus `<App />` di `main.tsx`, menjadikan context tersedia di seluruh aplikasi.
  - Hook publik `useCart()` diekspos dengan guard error jika digunakan di luar `CartProvider`.
- [ ] **Order Context:** Logika pembuatan order baru, riwayat order, dan tracking status order.
- [ ] **Integrasi API/Mock Services:** Pembuatan custom hooks untuk fetch data produk organik dari mock data.

### Phase 4.5: Backend Server Development (Node.js, Express, Prisma, Postgres) 🟢 (COMPLETED)
- [x] **Inisialisasi Server & Boilerplate:**
  - Setup Express server dengan TypeScript (`tsx`, `ts-node`, `nodemon`) dan ESLint.
  - Integrasi Neon PostgreSQL Server menggunakan Prisma ORM dengan konfigurasi `@prisma/adapter-neon` untuk koneksi serverless yang stabil.
- [x] **Modul Autentikasi (`authRouter` & `authController`):**
  - Endpoint Registrasi (`/api/auth/register`) & Login (`/api/auth/login`) dengan enkripsi password menggunakan `bcrypt`.
  - Pembuatan JWT Token (`jwt.sign`) dengan masa aktif 30 hari.
  - Deteksi status administrator secara otomatis menggunakan pencocokan email dari variabel lingkungan `ADMIN_EMAILS`.
- [x] **Modul Produk & CRUD (`productRouter` & `productController`):**
  - Endpoint publik untuk mengambil katalog produk (`GET /api/products`) dengan filter dinamis (Kategori, Query pencarian, Rentang harga, Sorting).
  - Endpoint publik untuk detail produk (`GET /api/products/:id`) dan Flash Deals (`GET /api/products/flash-deals`).
  - Proteksi rute administrasi menggunakan middleware `auth` dan `admin` untuk operasi pembuatan (`POST /`), pembaruan (`PUT /:id`), dan penghapusan (`DELETE /:id`) produk.
- [x] **Modul Unggah Gambar (`uploadRouter`):**
  - Endpoint `/api/upload` dengan middleware `auth` untuk membatasi pengunggahan hanya bagi pengguna terautentikasi.
  - Integrasi pustaka `multer` untuk mengelola *multipart/form-data* di dalam memory (`multer.memoryStorage()`).
  - Integrasi Cloudinary SDK untuk mengunggah gambar ke cloud (`cloudinary.uploader.upload`) menggunakan format data URI base64.
- [x] **Modul Manajemen Pesanan (`orderRouter` & `orderController`):**
  - Endpoint Pembuatan Order (`POST /api/orders`) dengan verifikasi harga asli database, pengecekan stok produk, kalkulasi pajak/biaya kirim otomatis, serta auto-decrement stok setelah berhasil.
  - Endpoint User Order (`GET /api/orders`) untuk melihat riwayat pesanan dengan filter status.
  - Endpoint Detail Order (`GET /api/orders/:id`) dan Lokasi Kurir (`GET /api/orders/:id/location`).
  - Endpoint Khusus Admin (`GET /api/orders/all` & `PUT /api/orders/:id/status`) dengan update log riwayat status pesanan.
- [x] **Integrasi Background Jobs & Workflow (Inngest & Brevo):**
  - Integrasi **Inngest Engine** (`/api/inngest`) untuk memproses event asinkronus secara andal dan terjadwal.
  - **Notifikasi Stok Menipis (`Low Stock Alert`):** Mendeteksi event `inventory/stock.updated` dan mengirimkan email peringatan ke administrator ketika stok produk di bawah 10 unit.
  - **Promosi Payday Bulanan (`Monthly Offers`):** Tugas cron terjadwal (`0 10 1 * *`) setiap tanggal 1 jam 10:00 untuk mengirimkan email berisi 6 produk promo terpopuler kepada semua pengguna terdaftar dalam mode batching (10 user per batch).
  - **Penetapan Kurir Otomatis (`Auto-Assign Rider`):** Memantau event `order/placed`, menunggu selama 5 menit (`step.sleep`), lalu secara otomatis menetapkan kurir aktif yang tidak sibuk serta memicu kode OTP serah terima unik 6-digit.
  - Integrasi **Nodemailer Brevo SMTP Relay** (`smtp-relay.brevo.com`) dengan template email HTML modern dan responsif.

### Phase 5: Sentuhan Premium, Animasi & Launching 🔴 (PLANNED)
- [ ] Integrasi animasi transisi antar halaman (Page Transitions).
- [ ] UI Polish: Glassmorphism untuk modal, dynamic skeleton loader saat memuat data produk, efek hover transform.
- [ ] Validasi responsivitas mobile-first lengkap.
- [ ] Uji coba aliran checkout akhir dan integrasi notifikasi sukses lewat `react-hot-toast`.

### 📝 TODO & Future Integrations / Improvements
- [ ] **Integrasi API Frontend & Backend secara Menyeluruh:** Hubungkan React client agar mengonsumsi REST API dari server Express untuk Autentikasi, CRUD produk, buku alamat, manajemen keranjang, riwayat order, dan halaman pelacakan pesanan.
- [ ] **Validasi Skema Input (Backend):** Terapkan pustaka validasi skema seperti `Zod` pada request body di endpoint Registrasi, Login, CRUD Product, dan Checkout untuk mencegah data corrupt dan SQL injection.
- [ ] **Penanganan Error Terpusat & Logging:** Tingkatkan middleware error handling di backend agar dapat menangkap error spesifik Prisma dan menambahkan logging library seperti `winston` atau `morgan` untuk analisis error produksi.
- [ ] **Live Courier Tracking (Real-Time):** Integrasikan WebSocket (Socket.io) untuk memperbarui koordinat kurir pada database dan memicu pergerakan truk kurir di `LiveMap` client secara real-time.
- [ ] **Simulasi OTP Delivery Confirmation:** Bangun fitur simulasi serah terima menggunakan modal input. Jika kode OTP yang dimasukkan cocok dengan `order.deliveryOtp`, status pesanan berubah menjadi `"Delivered"` secara lokal — sebagai representasi dari alur validasi kurir di dunia nyata.
- [ ] **Integrasi Peta Leaflet di `Addresses.tsx`:** Tambahkan fitur *pick location on map* saat pengguna menambahkan atau mengedit alamat baru.
- [ ] **Auth Context & Session Management:** Implementasikan `AuthContext` yang menyimpan data sesi login pengguna (`User` interface) secara global, menggantikan simulasi login statis saat ini.
- [ ] **Integrasi Ulasan Produk Dinamis:** Saat ini antarmuka ulasan pelanggan (Customer Reviews) sudah diimplementasikan (via `DummyReviewsSection.tsx`), namun masih menggunakan *mock data* yang di-*generate* secara statis. Komponen ini akan diperbarui untuk mendukung sistem ulasan yang sepenuhnya dinamis (*real-time* rendering dan form *submit* ulasan) segera setelah integrasi dengan layanan *Backend* dan *Database* diselesaikan.
- [ ] **Global Search Autocomplete:** Membangun *dropdown* saran pencarian dinamis (*debounced*) pada *search bar* utama untuk meningkatkan interaktivitas penemuan produk.
- [ ] **Fitur Wishlist (Produk Favorit):** Mengizinkan pengguna untuk menyimpan produk yang diminati (selain dari keranjang belanja), lengkap dengan sinkronisasi ke profil dan tampilan halamannya tersendiri.
- [ ] **Payment Gateway Integration:** Menghubungkan proses pada halaman `Checkout.tsx` dengan penyedia pembayaran eksternal (mis. Stripe atau Midtrans) untuk mensimulasikan transaksi yang sesungguhnya.
- [ ] **Progressive Web App (PWA):** Mengimplementasikan konfigurasi *Service Worker* dan *Web Manifest* sehingga aplikasi GroceShop dapat diinstal (installable) pada *smartphone* atau *desktop* layaknya aplikasi asli, serta memiliki mode *offline fallback*.
- [ ] **Dark Mode Toggle:** Menambahkan utilitas pengubah tema (*light/dark mode*) secara utuh dengan memaksimalkan variabel warna Tailwind CSS v4.

---

## 📊 Alur & Arsitektur Aplikasi (App Flow & Architecture)

Berikut adalah diagram alur navigasi, perutean (routing), dan perlindungan halaman (*route guarding*) di GroceShop menggunakan Mermaid.js:

```mermaid
graph TD
    %% Styling
    classDef public fill:#e6f4ea,stroke:#137333,stroke-width:2px,color:#137333;
    classDef protected fill:#fef7e0,stroke:#b06000,stroke-width:2px,color:#b06000;
    classDef layout fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px,color:#1a73e8;
    classDef guard fill:#fad2e1,stroke:#bc3a6a,stroke-width:2px,color:#bc3a6a;
    classDef root fill:#f1f3f4,stroke:#3c4043,stroke-width:2px,color:#3c4043;
    classDef admin fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px,color:#7c3aed;
    classDef delivery fill:#fff1f2,stroke:#e11d48,stroke-width:2px,color:#e11d48;

    %% Elements
    A["main.tsx: BrowserRouter"] :::root --> B["App.tsx: Routes Container"] :::root
    B --> C{"Pilih Rute"} :::root
    
    %% Public Routes Layout (AppLayout)
    C -->|Rute Utama /| L_Layout["AppLayout.tsx - Main Layout Wrapper"] :::layout
    
    %% AppLayout Components
    L_Layout --> L_Banner["Banner.tsx - Promosi"] :::layout
    L_Layout --> L_Navbar["Navbar.tsx - Header dan Search"] :::layout
    L_Layout --> L_Outlet["Outlet - Content Area"] :::layout
    L_Layout --> L_Footer["Footer - Informasi"] :::layout
    
    %% Public Sub-routes
    L_Outlet --> P_Home["Home.tsx - Beranda"] :::public
    L_Outlet --> P_Catalog["Products.tsx - Katalog Grocery"] :::public
    L_Outlet --> P_Detail["ProductPage.tsx - Detail Produk"] :::public
    L_Outlet --> P_Search["SearchResults.tsx - Cari"] :::public
    L_Outlet --> P_Deals["FlashDeals.tsx - Penawaran Kilat"] :::public
    
    %% Guarded Paths
    L_Outlet --> G_Guard["ProtectedRoute.tsx - Route Guard"] :::guard
    G_Guard -->|Belum Login| P_Login["Login.tsx - Sign In / Sign Up"] :::public
    G_Guard -->|Sudah Login| PR_Group["Akses Halaman Terproteksi"] :::protected
    
    %% Protected Routes
    PR_Group --> PR_Checkout["Checkout.tsx - Pembayaran"] :::protected
    PR_Group --> PR_Orders["MyOrders.tsx - Riwayat Belanja"] :::protected
    PR_Group --> PR_Track["OrderTracking.tsx - Peta dan Kurir"] :::protected
    PR_Group --> PR_Addr["Addresses.tsx - Buku Alamat"] :::protected
    
    %% Standalone Routes
    C -->|Rute /login| P_Login

    %% Admin Routes
    C -->|Rute /admin| A_Layout["AdminLayout.tsx - Admin Layout"] :::admin
    A_Layout --> A_Dash["AdminDashboard.tsx"] :::admin
    A_Layout --> A_Prod["AdminProducts.tsx"] :::admin
    A_Layout --> A_ProdForm["AdminProductForm.tsx - New/Edit"] :::admin
    A_Layout --> A_Ord["AdminOrders.tsx"] :::admin
    A_Layout --> A_DP["AdminDeliveryPartners.tsx"] :::admin

    %% Delivery Routes
    C -->|Rute /delivery/login| D_Login["DeliveryLogin.tsx - Kurir Login"] :::delivery
    C -->|Rute /delivery| D_Layout["DeliveryLayout.tsx - Kurir Layout"] :::delivery
    D_Layout --> D_Dash["DeliveryDashboard.tsx - Daftar Order Kurir"] :::delivery
```

### 💡 Deskripsi Alur Aplikasi
1. **Root Wrapper:** Aplikasi dibungkus `<BrowserRouter>` pada `main.tsx` untuk menyediakan konteks navigasi global bagi `<App />`.
2. **Layouting Global (`AppLayout`):** Rute publik berada di bawah struktur tata letak induk `AppLayout.tsx`. Ini memastikan komponen seperti `Banner` (promosi atas), `Navbar` (bilah menu, bar pencarian, & tombol keranjang), dan `Footer` tetap terlihat secara konsisten di semua halaman publik dan transaksi.
3. **Penyaringan Rute Terproteksi (`ProtectedRoute`):** Halaman transaksional yang sensitif (seperti keranjang pembayaran, riwayat transaksi, pengaturan alamat, dan peta tracking) dilindungi oleh pembungkus rute `ProtectedRoute.tsx`. Jika sesi pengguna tidak terdeteksi, rute secara otomatis akan mengalihkan pengguna ke halaman `/login`.
4. **Alur Otentikasi Simulatif (`Login.tsx`):** Menawarkan formulir Sign In dan Sign Up interaktif lengkap dengan penanda loading kustom. Setelah login berhasil, pengguna akan segera dilemparkan kembali ke beranda `/` dalam status terautentikasi.

---

## 🎨 Panduan Desain Sistem & Tema Kustom

Desain GroceShop menggunakan pendekatan natural organik dengan perpaduan warna-warna berikut yang telah didefinisikan pada `src/index.css`:

| Token CSS | Kode Warna | Penggunaan Utama |
| :--- | :--- | :--- |
| `--color-app-green` | `#1b3022` | Warna dasar brand (Forest Dark), Teks utama, Header dominan |
| `--color-app-green-light` | `#2d4a35` | Tombol utama, hover state, badge natural |
| `--color-app-green-lighter`| `#3d6b4a` | Border aktif, scrollbar thumb, aksen dedaunan |
| `--color-app-orange` | `#f97316` | Warna aksen (Flash sale, diskon, tombol pemicu tindakan) |
| `--color-app-cream` | `#faf7f2` | Background aplikasi utama (hangat, lembut di mata) |
| `--color-app-cream-dark` | `#f0ebe3` | Background card, form inputs, pemisah section |

### ✏️ Tipografi Premium
* **Sans Font:** `Outfit`, sans-serif (Sangat bersih untuk teks tubuh, harga, form, dan menu).
* **Serif Font:** `DM Serif Display`, serif (Sangat elegan untuk judul utama, banner promo, dan nama brand).

---

## 📂 Struktur Folder Proyek Saat Ini

```text
GroceShop/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets (images, icons)
│   ├── src/
│   │   ├── assets/             # Gambar & Ilustrasi & Mock Data (assets.ts)
│   │   ├── components/         # Reusable UI Components & Route Guards
│   │   │   ├── Checkout/          # Sub-komponen Halaman Checkout
│   │   │   │   ├── CheckoutAddress.tsx  # Step 1: Pilih Alamat Pengiriman
│   │   │   │   ├── CheckoutPayment.tsx  # Step 2: Pilih Metode Pembayaran
│   │   │   │   └── CheckoutReview.tsx   # Step 3: Review & Konfirmasi Order
│   │   │   ├── Home/              # Sub-komponen Khusus Halaman Utama (Home)
│   │   │   │   ├── AppPromoBanner.tsx # Banner Promo Unduh Aplikasi (App Store & Play)
│   │   │   │   ├── Features.tsx   # Seksi Fitur Layanan Unggulan
│   │   │   │   ├── Hero.tsx       # Seksi Banner Hero Selamat Datang & CTA
│   │   │   │   ├── HomeCategories.tsx # Kategori Produk Horizontal Scrollable
│   │   │   │   ├── NewsLetter.tsx # Formulir Berlangganan Newsletter
│   │   │   │   └── PopularProducts.tsx # Grid Produk Terpopuler Musim Ini
│   │   │   ├── OrderTracking/     # Sub-komponen Halaman Pelacakan Pesanan
│   │   │   │   ├── LiveMap.tsx    # Peta Interaktif Leaflet (Tracking Real-Time)
│   │   │   │   ├── OrderOTP.tsx   # Kartu Kode OTP Verifikasi Serah Terima
│   │   │   │   └── OrderTimeLine.tsx # Riwayat Progres Status Pesanan
│   │   │   ├── AddressCard.tsx    # Kartu Alamat (Edit & Delete)
│   │   │   ├── AddressForm.tsx    # Modal Form Tambah / Edit Alamat
│   │   │   ├── Banner.tsx         # Banner Promosi Interaktif Kustom
│   │   │   ├── CartSidebar.tsx    # Sidebar Keranjang Belanja
│   │   │   ├── FilterPanel.tsx    # Panel Filter Produk (Katalog)
│   │   │   ├── Footer.tsx         # Footer Global Premium (Brand, Links, Kontak)
│   │   │   ├── Loading.tsx        # Komponen Spinner Loading Global
│   │   │   ├── Navbar.tsx         # Bilah Navigasi Utama & Dropdown Profil
│   │   │   ├── ProductCard.tsx    # Kartu Produk Reusable & Fungsional
│   │   │   └── ProtectedRoute.tsx # Komponen Pelindung Rute Terproteksi
│   │   ├── context/            # React Context (Cart, Auth, Order)
│   │   │   └── CartContext.tsx    # Cart State Global (Persistensi localStorage)
│   │   ├── pages/              # Halaman Aplikasi
│   │   │   ├── admin/             # Halaman Panel Administrator
│   │   │   │   ├── AdminLayout.tsx      # Layout Khusus Admin (Sidebar)
│   │   │   │   ├── AdminDashboard.tsx   # Ringkasan & Statistik
│   │   │   │   ├── AdminProducts.tsx    # Manajemen Produk (List)
│   │   │   │   ├── AdminProductForm.tsx # Form Tambah / Edit Produk
│   │   │   │   ├── AdminOrders.tsx      # Manajemen Pesanan
│   │   │   │   └── AdminDeliveryPartners.tsx # Manajemen Mitra Kurir
│   │   │   ├── delivery/          # Halaman Aplikasi Kurir
│   │   │   │   ├── DeliveryLogin.tsx    # Login Khusus Kurir
│   │   │   │   ├── DeliveryLayout.tsx   # Layout Kurir (Header/Nav)
│   │   │   │   └── DeliveryDashboard.tsx # Dashboard Daftar Order Kurir
│   │   │   ├── Addresses.tsx      # Buku Alamat Pengguna
│   │   │   ├── AppLayout.tsx      # Layout Utama (Banner + Navbar + Footer)
│   │   │   ├── Checkout.tsx       # Halaman Checkout Multi-Step
│   │   │   ├── FlashDeals.tsx     # Halaman Penawaran Kilat
│   │   │   ├── Home.tsx           # Beranda Utama
│   │   │   ├── Login.tsx          # Halaman Sign In / Sign Up
│   │   │   ├── MyOrders.tsx       # Riwayat Pesanan Pengguna
│   │   │   ├── OrderTracking.tsx  # Pelacakan Pesanan Real-Time
│   │   │   ├── ProductPage.tsx    # Detail Produk
│   │   │   ├── Products.tsx       # Katalog Produk
│   │   │   └── SearchResults.tsx  # Halaman Hasil Pencarian
│   │   ├── types/              # Deklarasi Type TypeScript
│   │   │   └── index.ts        # Interface User, Product, Order, Address, dll.
│   │   ├── App.tsx             # Root Component (Sistem Routing Lengkap)
│   │   ├── index.css           # Konfigurasi Tailwind v4 & Animasi CSS
│   │   └── main.tsx            # Entry Point Aplikasi
│   ├── package.json            # Daftar dependensi & script proyek
│   └── vite.config.ts          # Integrasi React & Tailwind di Vite
└── README.md                   # File dokumentasi & roadmap utama ini
```

---

## ⚙️ Cara Menjalankan Proyek Secara Lokal

1. Masuk ke dalam direktori aplikasi frontend:
   ```bash
   cd client
   ```
2. Instal semua paket dependensi (jika baru di-clone):
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka peramban (browser) dan akses alamat yang tertera di terminal (biasanya `http://localhost:5173`).
