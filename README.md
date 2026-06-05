# 🛒 GroceShop - Full-Stack E-Commerce Grocery Application

<div align="center">

![React](https://img.shields.io/badge/React-19.2.6-61dafb?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646cff?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2d3748?style=flat&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=flat&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat&logo=stripe&logoColor=white)

**Aplikasi e-commerce grocery modern dengan desain premium, real-time tracking, dan integrasi payment gateway lengkap.**

[Live Demo](https://groce-shop-rouge.vercel.app/) • [Admin Demo](https://groce-shop-rouge.vercel.app/admin) • [Delivery Portal](https://groce-shop-rouge.vercel.app/delivery/login)

</div>

---

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Unggulan](#-fitur-unggulan)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Design System](#-design-system)
- [Project Roadmap](#-project-roadmap)
- [Folder Structure](#-folder-structure)
- [Environment Setup](#-environment-setup)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

---

## 🎯 Tentang Proyek

GroceShop adalah aplikasi e-commerce belanja bahan makanan (grocery) full-stack yang dibangun dengan **React**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Node.js**, **Express**, **Prisma ORM**, dan **PostgreSQL (Neon Serverless)**.

Aplikasi ini didesain dengan estetika berkelas menggunakan palet warna natural (Forest Green & Orange Accent), tipografi premium, serta animasi mikro interaktif untuk memberikan pengalaman pengguna yang luar biasa.

> **📝 Portfolio Note:** Proyek ini awalnya terinspirasi dari tutorial e-commerce channel YouTube **GreatStack**, namun telah dikembangkan lebih jauh dengan berbagai fitur kustom dan penyempurnaan UI/UX yang tidak ada dalam tutorial aslinya.

---

## ✨ Fitur Unggulan

### 🛍️ **Customer Experience**

- 🎨 **Desain Premium** - UI/UX modern dengan glassmorphism & micro-animations
- 🔍 **Global Search Autocomplete** - Pencarian instan dengan dropdown saran & keyboard navigation
- 🔍 **Smart Search & Filter** - Filter dinamis URL-driven (kategori, organik, harga, sorting)
- 🛒 **Reactive Cart** - Keranjang real-time dengan persistensi localStorage
- 💳 **Multiple Payment** - Stripe (kartu kredit) & Cash on Delivery (COD)
- 📍 **Real-Time Tracking** - Pelacakan kurir live dengan peta interaktif
- ⭐ **Product Reviews** - Review & rating dengan integrasi purchase verification (hanya pembeli)
- 📱 **Responsive Design** - Mobile-first approach untuk semua device

### 👨‍💼 **Admin Dashboard**

- 📊 **Analytics Dashboard** - Statistik penjualan, order, dan revenue
- 📦 **Product Management** - CRUD lengkap dengan upload gambar ke Cloudinary
- 📋 **Order Management** - Manajemen pesanan & assign kurir
- 🚴 **Delivery Partners** - Manajemen mitra kurir

### 🚴 **Delivery Partner Portal**

- 📲 **Auto-Assignment** - Penugasan otomatis via background jobs
- 🔢 **OTP Verification** - Sistem OTP 6-digit untuk konfirmasi delivery
- 🗺️ **GPS Tracking** - Berbagi lokasi real-time ke customer
- 📊 **Dashboard** - Daftar tugas & status delivery

### ⚡ **Advanced Features**

- 🎯 **Flash Deals** - Halaman promo dengan filter algoritmik (diskon ≥10%)
- 📧 **Email Notifications** - Low stock alert, promo bulanan, order updates
- 🔄 **Auto-Refresh** - Dashboard kurir update otomatis tanpa reload
- 🔐 **Role-Based Access** - User, Admin, Delivery Partner
- 🛡️ **Verified Reviews** - Review hanya dari pembeli yang sudah diverifikasi via order history
- 🌐 **Multi-language (EN/ID)** - Dukungan bahasa Inggris & Indonesia dengan switch instan
- 💰 **IDR (Rupiah) Pricing** - Semua harga ditampilkan dalam Rupiah dengan format Rp X.XXX

---

## 🛠️ Tech Stack

### **Frontend**

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 19.2.6  | UI Framework            |
| TypeScript       | 6.0     | Type Safety             |
| Vite             | 8.0     | Build Tool              |
| Tailwind CSS     | 4.3.0   | Styling                 |
| React Router     | 7.15.1  | Routing                 |
| i18next          | 25.0.0  | Internationalization    |
| react-i18next    | 15.6.0  | React i18n integration  |
| Axios            | 1.17.0  | HTTP Client             |
| Socket.io Client | 4.8.3   | Real-time Communication |
| React Leaflet    | 5.0.0   | Maps Integration        |
| React Hot Toast  | 2.6.0   | Notifications           |
| Lucide React     | 1.16.0  | Icons                   |

### **Backend**

| Technology        | Version    | Purpose            |
| ----------------- | ---------- | ------------------ |
| Node.js           | Latest     | Runtime            |
| Express           | 5.2.1      | Web Framework      |
| TypeScript        | 6.0.3      | Type Safety        |
| Prisma            | 7.8.0      | ORM                |
| PostgreSQL (Neon) | Serverless | Database           |
| Socket.io         | 4.8.3      | WebSocket Server   |
| Stripe            | 22.2.0     | Payment Processing |
| Inngest           | 4.5.0      | Background Jobs    |
| Nodemailer        | 8.0.10     | Email Service      |
| Cloudinary        | 2.10.0     | Image Storage      |
| JWT               | 9.0.3      | Authentication     |
| Bcrypt            | 6.0.0      | Password Hashing   |

---

## 🏗️ Arsitektur Sistem

```mermaid
graph TB
    %% Client Layer
    subgraph "🖥️ Frontend (React + Vite)"
        A[Customer App] --> B[Admin Dashboard]
        A --> C[Delivery Portal]
    end

    %% API Layer
    subgraph "⚡ Backend (Node.js + Express)"
        D[REST API] --> E[Socket.io Server]
        D --> F[Stripe Webhook]
        D --> G[Inngest Functions]
    end

    %% Data Layer
    subgraph "💾 Data & Storage"
        H[(PostgreSQL - Neon)]
        I[Cloudinary]
        J[localStorage]
    end

    %% External Services
    subgraph "🔗 External Services"
        K[Stripe Payment]
        L[Brevo Email]
        M[Inngest Jobs]
    end

    A --> D
    B --> D
    C --> E
    D --> H
    E --> H
    G --> H
    F --> D
    D --> I
    A --> J
    G --> L
    G --> M
    D --> K

    classDef client fill:#e6f4ea,stroke:#137333,stroke-width:2px
    classDef server fill:#fef7e0,stroke:#b06000,stroke-width:2px
    classDef data fill:#e8f0fe,stroke:#1a73e8,stroke-width:2px
    classDef external fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px

    class A,B,C client
    class D,E,F,G server
    class H,I,J data
    class K,L,M external
```

### **Alur Data Real-Time Delivery Tracking**

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Frontend
    participant Socket as Socket.io
    participant BE as Backend
    participant DB as Database
    participant D as Delivery Partner

    D->>Socket: send-live-location (lat, lng, orderId)
    Socket->>DB: Update liveLocation
    Socket->>FE: receive-live-location
    FE->>C: Update peta real-time

    D->>Socket: Update status (Out for Delivery)
    Socket->>BE: Trigger auto-track
    BE->>DB: Save status
    Socket->>FE: Status update
    FE->>C: Show tracking timeline
```

---

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- npm atau pnpm
- PostgreSQL database (atau Neon Serverless)
- Stripe account (untuk payment)
- Cloudinary account (untuk image storage)

### **Installation**

1. **Clone repository**

```bash
git clone https://github.com/meandrewaprianto/GroceShop.git
cd GroceShop
```

2. **Setup Frontend**

```bash
cd client
npm install
cp .env.example .env  # Sesuaikan environment variables
npm run dev
# Frontend berjalan di http://localhost:5173
```

3. **Setup Backend**

```bash
cd server
npm install
cp .env.example .env  # Sesuaikan environment variables
npm run server
# Backend berjalan di http://localhost:3000
```

4. **Seed Database (Optional)**

```bash
cd server
npm run seed
```

---

## 📡 API Documentation

### **Authentication Endpoints**

| Method | Endpoint             | Description        | Auth Required |
| ------ | -------------------- | ------------------ | ------------- |
| POST   | `/api/auth/register` | Register user baru | ❌            |
| POST   | `/api/auth/login`    | Login user         | ❌            |
| GET    | `/api/auth/me`       | Get current user   | ✅            |

### **Product Endpoints**

| Method | Endpoint                   | Description                          | Auth Required |
| ------ | -------------------------- | ------------------------------------ | ------------- |
| GET    | `/api/products/categories` | Get all product categories (dynamic) | ❌            |
| GET    | `/api/products/search`     | Search autocomplete (suggestions)    | ❌            |
| GET    | `/api/products`            | Get all products (dengan filter)     | ❌            |
| GET    | `/api/products/:id`        | Get product detail                   | ❌            |
| POST   | `/api/products`            | Create product                       | ✅ Admin      |
| PUT    | `/api/products/:id`        | Update product                       | ✅ Admin      |
| DELETE | `/api/products/:id`        | Delete product                       | ✅ Admin      |

### **Order Endpoints**

| Method | Endpoint                | Description      | Auth Required |
| ------ | ----------------------- | ---------------- | ------------- |
| POST   | `/api/orders`           | Create new order | ✅            |
| GET    | `/api/orders`           | Get user orders  | ✅            |
| GET    | `/api/orders/:id`       | Get order detail | ✅            |
| GET    | `/api/orders/admin/all` | Get all orders   | ✅ Admin      |

### **Address Endpoints**

| Method | Endpoint             | Description        | Auth Required |
| ------ | -------------------- | ------------------ | ------------- |
| GET    | `/api/addresses`     | Get user addresses | ✅            |
| POST   | `/api/addresses`     | Create address     | ✅            |
| PUT    | `/api/addresses/:id` | Update address     | ✅            |
| DELETE | `/api/addresses/:id` | Delete address     | ✅            |

### **Review Endpoints**

| Method | Endpoint                   | Description                   | Auth Required      |
| ------ | -------------------------- | ----------------------------- | ------------------ |
| GET    | `/api/reviews/product/:id` | Get all reviews for a product | ❌ (optional auth) |
| POST   | `/api/reviews`             | Create a new review           | ✅ (must be buyer) |
| PUT    | `/api/reviews/:id`         | Update own review             | ✅                 |
| DELETE | `/api/reviews/:id`         | Delete own review             | ✅                 |
| POST   | `/api/reviews/:id/helpful` | Mark review as helpful        | ✅                 |

### **Admin Endpoints**

| Method | Endpoint                       | Description               | Auth Required |
| ------ | ------------------------------ | ------------------------- | ------------- |
| GET    | `/api/admin/stats`             | Get dashboard statistics  | ✅ Admin      |
| GET    | `/api/admin/delivery-partners` | Get all delivery partners | ✅ Admin      |
| POST   | `/api/admin/delivery-partners` | Create delivery partner   | ✅ Admin      |
| PUT    | `/api/admin/orders/:id/assign` | Assign delivery partner   | ✅ Admin      |

### **Delivery Endpoints**

| Method | Endpoint                          | Description            | Auth Required |
| ------ | --------------------------------- | ---------------------- | ------------- |
| POST   | `/api/delivery/login`             | Delivery partner login | ❌            |
| GET    | `/api/delivery/orders`            | Get assigned orders    | ✅ Delivery   |
| PUT    | `/api/delivery/orders/:id/status` | Update order status    | ✅ Delivery   |
| POST   | `/api/delivery/orders/:id/otp`    | Verify OTP             | ✅ Delivery   |

### **WebSocket Events**

| Event                   | Direction       | Description                             |
| ----------------------- | --------------- | --------------------------------------- |
| `join-order-room`       | Client → Server | Customer join tracking room             |
| `join-partner-room`     | Client → Server | Delivery partner join notification room |
| `send-live-location`    | Client → Server | Delivery partner send GPS location      |
| `receive-live-location` | Server → Client | Customer receive live location          |
| `order-assigned`        | Server → Client | Notify new order assignment             |

---

## 💾 Database Schema

```prisma
model User {
    id        String    @id @default(uuid())
    name      String
    email     String    @unique
    password  String
    phone     String?   @default("")
    avatar    String?   @default("")
    addresses Address[]
    orders    Order[]
    createdAt DateTime  @default(now())
    updatedAt DateTime  @updatedAt
}

model Address {
    id        String   @id @default(uuid())
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    label     String
    address   String
    city      String
    state     String
    zip       String
    isDefault Boolean  @default(false)
    lat       Float
    lng       Float
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Product {
    id            String   @id @default(uuid())
    name          String
    description   String?  @default("")
    price         Float
    originalPrice Float?
    image         String
    category      String
    unit          String?  @default("piece")
    stock         Int?     @default(0)
    isOrganic     Boolean? @default(false)
    rating        Float?   @default(0)
    reviewCount   Int?     @default(0)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
}

model Order {
    id              String @id @default(uuid())
    userId          String
    user            User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    items           Json
    shippingAddress Json
    paymentMethod   String @default("card")
    subtotal        Float
    deliveryFee     Float? @default(0)
    tax             Float? @default(0)
    total           Float
    status          String @default("Placed")
    statusHistory   Json

    deliveryPartnerId String?
    deliveryPartner   DeliveryPartner? @relation(fields: [deliveryPartnerId], references: [id], onDelete: SetNull)
    deliveryOtp       String?          @default("")
    liveLocation      Json?
    isPaid            Boolean?         @default(false)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model DeliveryPartner {
    id          String   @id @default(uuid())
    name        String
    email       String   @unique
    password    String
    phone       String
    avatar      String?  @default("")
    vehicleType String?  @default("bike")
    isActive    Boolean? @default(true)
    orders      Order[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}
```

---

## 🎨 Design System

### **Color Palette**

| Token CSS                   | Kode Warna | Penggunaan Utama                            |
| --------------------------- | ---------- | ------------------------------------------- |
| `--color-app-green`         | `#1b3022`  | Warna dasar brand (Forest Dark), Teks utama |
| `--color-app-green-light`   | `#2d4a35`  | Tombol utama, hover state                   |
| `--color-app-green-lighter` | `#3d6b4a`  | Border aktif, scrollbar thumb               |
| `--color-app-orange`        | `#f97316`  | Warna aksen (Flash sale, diskon, CTA)       |
| `--color-app-cream`         | `#faf7f2`  | Background aplikasi utama                   |
| `--color-app-cream-dark`    | `#f0ebe3`  | Background card, form inputs                |

### **Typography**

| Font Family                  | Usage                                |
| ---------------------------- | ------------------------------------ |
| **Outfit** (Sans-serif)      | Body text, prices, forms, menu items |
| **DM Serif Display** (Serif) | Headings, promo banners, brand name  |

### **Component Library**

- **Buttons** - Primary, secondary, outline variants
- **Cards** - Product cards, order cards with hover effects
- **Modals** - Glassmorphism effect with backdrop blur
- **Forms** - Styled inputs with focus states
- **Badges** - Status indicators, category tags
- **Loaders** - Skeleton loaders, spinners

---

## 🗺️ Project Roadmap

### ✅ **Phase 1: Foundation (COMPLETED)**

- Project initialization with Vite + React + TypeScript
- Tailwind CSS v4 configuration
- Design system implementation
- Core dependencies installation
- TypeScript interfaces definition

### ✅ **Phase 2: Architecture & Routing (COMPLETED)**

- Layout components (AppLayout, AdminLayout, DeliveryLayout)
- 10+ page modules implementation
- Protected routes with guards
- Real-time notifications setup

### ✅ **Phase 3: UI Components (COMPLETED)**

- Reusable component library
- Home page components
- Product catalog with filters
- Cart sidebar with animations
- Checkout multi-step flow

### ✅ **Phase 4: State Management (COMPLETED)**

- Auth Context with JWT persistence
- Cart Context with localStorage sync
- API integration with Axios
- Error handling & loading states

### ✅ **Phase 5: Backend Development (COMPLETED)**

- Express server with TypeScript
- Prisma ORM + Neon PostgreSQL
- Authentication & authorization
- Product CRUD operations
- Order management system
- Background jobs (Inngest)
- Real-time tracking (Socket.io)
- Stripe payment integration

### ✅ **Phase 6: Delivery System (COMPLETED)**

- Delivery partner authentication
- Auto-assignment system
- OTP verification
- GPS location sharing
- Auto-refresh dashboard
- COD payment handling

### 🚧 **Future Enhancements**

- [x] **Global Search Autocomplete** - Dropdown saran pencarian dinamis dengan debounce & keyboard navigation
- [x] **Implementation** - Rating & review system dengan purchase verification
- [x] **Multi-language Support (EN/ID)** - i18n implementation dengan react-i18next
- [x] **IDR Currency Conversion** - Semua harga dikonversi ke Rupiah (Rp)
- [x] **Dynamic Categories** - Kategori diambil langsung dari database, tidak hardcoded
- [ ] **Wishlist System** - Simpan produk favorit
- [x] **Progressive Web App (PWA)** - Installable app experience with offline caching
- [x] **Dark Mode Toggle** - Light/dark theme switcher with CSS variables
- [ ] **Analytics Dashboard** - Advanced reporting
- [ ] **Push Notifications** - Browser notifications

---

## 📂 Folder Structure

```
GroceShop/
├── client/                          # Frontend Application (React + Vite)
│   ├── public/                      # Static assets
│   └── src/
│       ├── assets/                  # Images, illustrations & mock data
│       ├── components/              # Reusable UI components
│       │   ├── Checkout/            # Checkout flow components
│       │   ├── Delivery/            # Delivery tracking components
│       │   ├── Home/                # Home page components
│       │   ├── OrderTracking/       # Order tracking components
│       │   ├── AddressCard.tsx
│       │   ├── AddressForm.tsx
│       │   ├── Banner.tsx
│       │   ├── CartSidebar.tsx
│       │   ├── FilterPanel.tsx
│       │   ├── Footer.tsx
│       │   ├── Loading.tsx
│       │   ├── Navbar.tsx
│       │   ├── ProductCard.tsx
│       │   └── ProtectedRoute.tsx
│       ├── config/
│       │   └── api.ts               # Axios instance + JWT interceptor
│       ├── context/
│       │   ├── AuthContext.tsx      # Global auth state
│       │   └── CartContext.tsx      # Cart state + localStorage
│       ├── pages/
│       │   ├── admin/               # Admin panel pages
│       │   ├── delivery/            # Delivery partner pages
│       │   ├── Addresses.tsx
│       │   ├── AppLayout.tsx
│       │   ├── Checkout.tsx
│       │   ├── FlashDeals.tsx
│       │   ├── Home.tsx
│       │   ├── Login.tsx
│       │   ├── MyOrders.tsx
│       │   ├── OrderTracking.tsx
│       │   ├── ProductPage.tsx
│       │   ├── Products.tsx
│       │   └── SearchResults.tsx
│       ├── types/
│       │   └── index.ts             # TypeScript interfaces
│       ├── App.tsx                  # Main app component
│       ├── index.css                # Global styles + design system
│       └── main.tsx                 # App entry point
│
└── server/                          # Backend Application (Node.js + Express)
    ├── config/
    │   ├── cloudinary.ts            # Cloudinary configuration
    │   ├── nodemailer.ts            # Email service configuration
    │   └── prisma.ts                # Prisma + Neon client setup
    ├── controllers/
    │   ├── adminController.ts       # Admin operations
    │   ├── authController.ts        # Authentication
    │   ├── deliveryController.ts    # Delivery partner operations
    │   ├── orderController.ts       # Order management
    │   ├── productController.ts     # Product CRUD
    │   ├── addressController.ts     # Address management
    │   ├── reviewController.ts      # Product reviews & ratings
    │   └── webhooks.ts              # Stripe webhook handler
    ├── inngest/                     # Background jobs
    │   ├── functions/
    │   │   ├── lowStockAlert.ts     # Low stock email alerts
    │   │   ├── monthlyOffers.ts     # Monthly promo emails
    │   │   └── autoAssignRider.ts   # Auto-assign delivery
    │   └── index.ts
    ├── middleware/
    │   ├── auth.ts                  # JWT user authentication + optionalAuth
    │   ├── admin.ts                 # Admin role guard
    │   └── deliveryAuth.ts          # Delivery partner JWT
    ├── prisma/
    │   └── schema.prisma            # Database schema
    ├── routes/
    │   ├── authRoutes.ts
    │   ├── productRoutes.ts
    │   ├── orderRoute.ts
    │   ├── addressRoute.ts
    │   ├── reviewRoutes.ts
    │   ├── adminRoute.ts
    │   ├── deliveryPartnerRoute.ts
    │   └── uploadRoutes.ts
    ├── generated/                   # Generated Prisma client
    ├── server.ts                    # Express + Socket.io entry
    ├── seed.ts                      # Database seeding
    └── package.json
```

---

## ⚙️ Environment Setup

### **Client Environment Variables** (`client/.env`)

```env
VITE_BASE_URL=http://localhost:3000/api
VITE_API_URL=http://localhost:3000
VITE_CURRENCY_SYMBOL=$
```

### **Server Environment Variables** (`server/.env`)

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/dbname

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Admin Configuration
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Application URLs
CLIENT_URL=http://localhost:5173
PORT=3000

# Inngest (Background Jobs)
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key
```

### **Getting API Keys**

1. **Neon PostgreSQL**: Sign up at [neon.tech](https://neon.tech)
2. **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com)
3. **Stripe**: Sign up at [stripe.com](https://stripe.com)
4. **Brevo**: Sign up at [brevo.com](https://brevo.com)
5. **Inngest**: Sign up at [inngest.com](https://inngest.com)

---

## 🧪 Testing

> **Note:** Testing suite masih dalam pengembangan. Rencana implementasi:
>
> - Unit tests dengan Vitest
> - Component tests dengan React Testing Library
> - E2E tests with Playwright

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the code style guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **GreatStack** - YouTube channel yang memberikan inspirasi dan tutorial dasar
- **Vercel** - Hosting platform untuk deployment
- **Neon** - Serverless PostgreSQL database
- **Cloudinary** - Image storage & optimization
- **Stripe** - Payment processing
- **Brevo** - Email service provider
- **Inngest** - Background job scheduling

### **Open Source Libraries**

- React, TypeScript, Vite, Tailwind CSS
- Express, Prisma, Socket.io
- Leaflet, React Hot Toast, Lucide Icons

---

<div align="center">

**Made with ❤️ by Andrew Aprianto**

[🌟 Star this repo](https://github.com/meandrewaprianto/GroceShop) • [🐛 Report Issue](https://github.com/meandrewaprianto/GroceShop/issues) • [💬 Discussions](https://github.com/meandrewaprianto/GroceShop/discussions)

</div>
