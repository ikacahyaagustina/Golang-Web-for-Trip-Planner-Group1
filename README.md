# Trip Planner Malang - Backend API

## Spesifikasi Proyek

- Backend API untuk website trip planner wisata Malang
- Stack: Express.js, PostgreSQL (pg), dotenv
- Versi Node.js: >= 18 (lihat "engines" di package.json)
- Versi npm: >= 9

## Cara Migrasi Database ke PostgreSQL

1. Install dependency (wajib minimal sekali per komputer setelah clone, dan jalankan lagi hanya kalau `package.json` / `package-lock.json` berubah, karena folder `node_modules` tidak ikut tersimpan di git):

   ```bash
   npm install
   ```
2. Siapkan file `.env` dengan konfigurasi:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=root
   DB_NAME=trip_planner
   PORT=3000
   JWT_SECRET=trip-planner-secret-change-me
   JWT_EXPIRES_IN=1d
   ```
3. Inisialisasi tabel database:

   ```bash
   npm run db:init
   ```
4. (Opsional) Isi data contoh untuk testing Postman:

   ```bash
   npm run db:seed
   ```

   Script ini akan:

   - Membuat user admin (default): `admin@example.com` / `admin123`
   - Mengisi beberapa data destinasi contoh (kalau tabel masih kosong)

## Cara Cek Koneksi Database

Jalankan perintah berikut untuk memastikan koneksi database sudah benar:

```bash
npm run db:test
```

Jika berhasil, akan muncul pesan koneksi sukses.

Untuk memastikan tabel sudah ada, jalankan:

```bash
npm run db:check
```

## Cara Testing API di Postman

### 1) Jalankan Server

```bash
npm run dev
# atau
npm run start
```

### 2) Base URL

```
http://localhost:3000/api
```

### 3) Catatan Global

- Header default: `Content-Type: application/json`
- Endpoint protected butuh header: `Authorization: Bearer <JWT_TOKEN>`
- Endpoint admin (create/update/delete destinasi) butuh user role `admin`
- Catatan: field `NUMERIC` dari PostgreSQL (contoh `price`) sering tampil sebagai string, mis. `"35000.00"`

---

### 0) Health Check

**Endpoint**

- GET `/health`

**Contoh response sukses (200)**

```json
{
   "success": true,
   "message": "API is healthy"
}
```

---

### 1) Register

**Endpoint**

- POST `/auth/register`

**Headers**

```json
{ "Content-Type": "application/json" }
```

**Body request (JSON)**

```json
{
   "name": "Budi Santoso",
   "email": "budi@example.com",
   "password": "password123"
}
```

**Contoh response sukses (201)**

```json
{
   "success": true,
   "message": "Register successful",
   "data": {
      "user": {
         "id": 1,
         "name": "Budi Santoso",
         "email": "budi@example.com",
         "role": "user",
         "created_at": "2026-04-15T05:10:00.000Z",
         "updated_at": "2026-04-15T05:10:00.000Z"
      },
      "token": "<JWT_TOKEN>"
   }
}
```

**Contoh response error (400)**

```json
{
   "success": false,
   "status": "fail",
   "message": "name, email, and password are required"
}
```

---

### 2) Login (Ambil JWT Token)

**Endpoint**

- POST `/auth/login`

**Body request (JSON)**

```json
{
   "email": "admin@example.com",
   "password": "admin123"
}
```

**Contoh response sukses (200)**

```json
{
   "success": true,
   "message": "Login successful",
   "data": {
      "user": {
         "id": 4,
         "name": "Admin",
         "email": "admin@example.com",
         "role": "admin",
         "created_at": "2026-04-15T05:01:43.775Z",
         "updated_at": "2026-04-15T05:01:43.775Z"
      },
      "token": "<JWT_TOKEN>"
   }
}
```

**Contoh response error (401)**

```json
{
   "success": false,
   "status": "fail",
   "message": "Invalid email or password"
}
```

---

### 3) Destinations (Public)

#### A) Get All Destinations

**Endpoint**

- GET `/destinations`

**Contoh response sukses (200)**

```json
{
   "success": true,
   "message": "Destinations fetched successfully",
   "data": [
      {
         "id": 1,
         "name": "Jatim Park 2",
         "category": "Wisata Keluarga",
         "price": "120000.00",
         "description": "Eco Green Park + Batu Secret Zoo (contoh data untuk testing).",
         "location": "Batu, Malang",
         "created_at": "2026-04-15T05:01:43.779Z",
         "updated_at": "2026-04-15T05:01:43.779Z",
         "avg_rating": "0",
         "total_reviews": 0
      }
   ]
}
```

#### B) Get Destination Detail

**Endpoint**

- GET `/destinations/:id`

**Contoh response error (404)**

```json
{
   "success": false,
   "status": "fail",
   "message": "Destination not found"
}
```

---

### 4) Destinations (Admin CRUD)

Semua endpoint di bawah ini butuh token admin.

**Header wajib**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### A) Create Destination

**Endpoint**

- POST `/destinations`

**Body request (JSON)**

```json
{
   "name": "Alun-Alun Batu",
   "category": "Kota",
   "price": 0,
   "description": "Tempat wisata gratis di pusat kota Batu.",
   "location": "Batu, Malang"
}
```

**Contoh response sukses (201)**

```json
{
   "success": true,
   "message": "Destination created successfully",
   "data": {
      "id": 10,
      "name": "Alun-Alun Batu",
      "category": "Kota",
      "price": "0.00",
      "description": "Tempat wisata gratis di pusat kota Batu.",
      "location": "Batu, Malang",
      "created_at": "2026-04-15T06:00:00.000Z",
      "updated_at": "2026-04-15T06:00:00.000Z"
   }
}
```

**Contoh response error (400) - body kurang lengkap**

```json
{
   "success": false,
   "status": "fail",
   "message": "name, category, price, description, and location are required"
}
```

**Contoh response error (401) - token tidak ada/invalid**

```json
{
   "success": false,
   "status": "fail",
   "message": "Unauthorized: token is required"
}
```

**Contoh response error (403) - bukan admin**

```json
{
   "success": false,
   "status": "fail",
   "message": "Forbidden: insufficient role"
}
```

#### B) Update Destination

**Endpoint**

- PUT `/destinations/:id`

**Body request (JSON)**

```json
{
   "price": 25000,
   "description": "Update deskripsi destinasi."
}
```

**Contoh response sukses (200)**

```json
{
   "success": true,
   "message": "Destination updated successfully",
   "data": {
      "id": 10,
      "name": "Alun-Alun Batu",
      "category": "Kota",
      "price": "25000.00",
      "description": "Update deskripsi destinasi.",
      "location": "Batu, Malang",
      "created_at": "2026-04-15T06:00:00.000Z",
      "updated_at": "2026-04-15T06:05:00.000Z"
   }
}
```

**Contoh response error (400) - id tidak valid**

```json
{
   "success": false,
   "status": "fail",
   "message": "Invalid destination id"
}
```

**Contoh response error (404) - id tidak ditemukan**

```json
{
   "success": false,
   "status": "fail",
   "message": "Destination not found"
}
```

#### C) Delete Destination

**Endpoint**

- DELETE `/destinations/:id`

**Contoh response sukses (200)**

```json
{
   "success": true,
   "message": "Destination deleted successfully"
}
```

**Contoh response error (404) - id tidak ditemukan**

```json
{
   "success": false,
   "status": "fail",
   "message": "Destination not found"
}
```

---

### 5) (Opsional) Itinerary

#### A) Generate Itinerary (Guest, Tidak Disimpan)

**Endpoint**

- POST `/itineraries/generate`

**Body request (JSON)**

```json
{
   "title": "Trip 1 Hari",
   "destination_ids": [1, 2, 3]
}
```

**Contoh response sukses (200) - ringkas**

```json
{
   "success": true,
   "message": "Itinerary generated successfully (guest mode, not saved)",
   "data": {
      "title": "Trip 1 Hari",
      "total_cost": 255000,
      "details": [],
      "found_count": 3,
      "requested_count": 3
   }
}
```

#### B) Save Itinerary (User Login)

**Endpoint**

- POST `/itineraries`

**Header wajib**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

### 6) (Opsional) Reviews

#### A) Submit/Update Review (User Login)

**Endpoint**

- POST `/reviews`

**Header wajib**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body request (JSON)**

```json
{
   "destination_id": 1,
   "rating": 5,
   "comment": "Mantap!"
}
```

#### B) Get Reviews by Destination (Public)

**Endpoint**

- GET `/reviews/destination/:destinationId`
