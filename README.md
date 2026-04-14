# Golang-Web-for-Trip-Planner-Group1

Dokumentasi singkat untuk setup awal Node.js dan koneksi PostgreSQL.

## Informasi Proyek

- Nama project: `golang-web-for-trip-planner-group1`
- Versi project: `1.0.0`
- Tipe module: `commonjs`

## Versi Runtime (Saat Dicek)

- Node.js: `v24.14.1`
- npm: `11.11.0`

## Kompatibilitas Untuk Tim

- Node.js minimum: `18.x`
- Node.js direkomendasikan: `20.x LTS` atau `22.x LTS`
- npm minimum: `9.x`
- PostgreSQL minimum: `14`
- PostgreSQL direkomendasikan: `16` sampai `18`

Project ini sudah dites berjalan dengan kombinasi:

- Node.js `24.14.1`
- PostgreSQL `18`

## Dependency Utama

- `pg` `^8.20.0` (client PostgreSQL untuk Node.js)
- `dotenv` `^17.4.2` (membaca variabel dari file `.env`)

## Konfigurasi Environment

1. Salin isi `.env.example` ke `.env` jika belum ada.
2. Pastikan isinya sesuai server PostgreSQL Anda:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=trip_planner
```

## Cara Menjalankan dan Test Koneksi

1. Install dependency:

```bash
npm install
```

2. Test koneksi database:

```bash
npm run db:test
```

Jika berhasil, output akan menampilkan:

- `Database connected successfully.`
- `Server time: ...`

## Script NPM yang Tersedia

- `npm run start` -> Menjalankan aplikasi utama (`src/index.js`)
- `npm run db:test` -> Menjalankan tes koneksi PostgreSQL (`src/index.js`)

## Test Koneksi Langsung di PostgreSQL (Opsional)

Jalankan query berikut di pgAdmin Query Tool:

```sql
SELECT current_database(), current_user, NOW();
```

Jika berhasil, query akan mengembalikan nama database aktif, user login, dan waktu server PostgreSQL.
