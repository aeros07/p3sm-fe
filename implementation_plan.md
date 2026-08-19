# Database Schema Plan (CMS Company Profile)

Berikut adalah rancangan struktur database final yang menyesuaikan dengan spesifikasi skema migrasi (*Blueprint*) Laravel yang Anda berikan. Tabel `companies`, `blog_categories`, dan `blogs` telah disesuaikan agar relasinya terhubung dengan benar ke tabel referensi yang Anda buat.

## 1. Tabel Referensi & Regional (Dari Anda)

**`social_medias`**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AI | |
| `icon` | TEXT | Nullable | URL icon sosmed CDN |
| `title` | VARCHAR(255) | Nullable | Judul sosmed (contoh: Instagram) |
| `url` | VARCHAR(255) | Nullable | URL sosmed |
| `username` | VARCHAR(255) | Nullable | Username sosmed |
| `created_at, updated_at` | TIMESTAMP | | |

**`provinces`**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `name` | VARCHAR(255) | Not Null |
| `created_at, updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`cities`**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `province_id`| BIGINT | FK -> `provinces.id` |
| `name` | VARCHAR(255) | Not Null |
| `created_at, updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`districts`**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `city_id` | BIGINT | FK -> `cities.id` |
| `name` | VARCHAR(255) | Not Null |
| `created_at, updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`sub_districts`**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AI | |
| `district_id`| BIGINT | Unsigned (FK -> `districts.id`) | |
| `name` | VARCHAR(255) | Not Null | |
| `postal_code`| VARCHAR(255) | Not Null | |
| `biteship_area_id`| VARCHAR(255) | Nullable | API Biteship Area ID |
| `created_at, updated_at` | TIMESTAMP | | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`medias`**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `name` | VARCHAR(255) | Not Null |
| `file_name` | VARCHAR(255) | Not Null |
| `full_url` | TEXT | Not Null |
| `thumb_url` | TEXT | Nullable |
| `file_extension` | VARCHAR(255) | Not Null |
| `created_at, updated_at` | TIMESTAMP | |

---

## 2. Tabel Utama (Menyesuaikan Relasi)

**`users` (Admin/Penulis)**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `name` | VARCHAR(255) | Not Null |
| `email` | VARCHAR(255) | Unique, Not Null |
| `password` | VARCHAR(255) | Not Null |
| `created_at, updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`companies` (Identitas & Kontak)**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AI | Hanya berisi 1 data (id=1) |
| `name` | VARCHAR(255) | Not Null | Nama Perusahaan |
| `title_web` | VARCHAR(100) | | Judul web (50-60 karakter) |
| `keywords` | TEXT | | Meta keywords |
| `about` | TEXT | | Tentang perusahaan |
| `meta_description`| TEXT | | Meta desc web |
| `custom_script` | TEXT | | Script JS Header/Analytics |
| `service_hours` | VARCHAR(255) | | Jam Layanan |
| `logo_square` | VARCHAR(255) | Nullable | Path/URL Logo Kotak (Upload langsung) |
| `logo_horizontal`| VARCHAR(255) | Nullable | Path/URL Logo Horizontal (Upload langsung) |
| `phone_number` | VARCHAR(50) | | |
| `email` | VARCHAR(255) | | |
| `address` | TEXT | | Alamat Jalan |
| `google_maps_url` | TEXT | | |
| `province_id` | BIGINT | Nullable | FK (Opsional) |
| `province_name` | VARCHAR(255) | Nullable | Nama Provinsi |
| `city_id` | BIGINT | Nullable | FK (Opsional) |
| `city_name` | VARCHAR(255) | Nullable | Nama Kota/Kabupaten |
| `district_id` | BIGINT | Nullable | FK (Opsional) |
| `district_name` | VARCHAR(255) | Nullable | Nama Kecamatan |
| `sub_district_id` | BIGINT | Nullable | FK (Opsional) |
| `sub_district_name` | VARCHAR(255) | Nullable | Nama Kelurahan |
| `created_at, updated_at` | TIMESTAMP | | |

**`blog_categories`**
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | BIGINT | PK, AI |
| `name` | VARCHAR(255) | Not Null |
| `slug` | VARCHAR(255) | Unique, Not Null |
| `description` | TEXT | Nullable |
| `media_id` | BIGINT | Nullable, FK -> `medias.id` |
| `created_at, updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`blogs`**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AI | |
| `category_id` | BIGINT | FK -> `blog_categories.id` | |
| `author_id` | BIGINT | FK -> `users.id` | |
| `title` | VARCHAR(255) | Not Null | |
| `slug` | VARCHAR(255) | Unique, Not Null | |
| `summary` | TEXT | Nullable | |
| `content` | LONGTEXT | Not Null | |
| `media_id` | BIGINT | Nullable, FK -> `medias.id` | Gambar thumbnail blog |
| `is_published` | BOOLEAN | Default `false` | `true` = Publish, `false` = Draft |
| `view_count` | BIGINT | Default 0 | |
| `published_at` | TIMESTAMP | Nullable | |
| `created_at, updated_at` | TIMESTAMP | | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

**`tags`**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, AI | |
| `name` | VARCHAR(255) | Not Null | Nama tag (contoh: Bisnis) |
| `slug` | VARCHAR(255) | Unique, Not Null | URL slug |
| `created_at, updated_at` | TIMESTAMP | | |

**`blog_tags` (Tabel Pivot)**
| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `blog_id` | BIGINT | FK -> `blogs.id` | |
| `tag_id` | BIGINT | FK -> `tags.id` | |

---

## Pertanyaan Terbuka untuk Anda (User Review Required)
> [!IMPORTANT]
> 1. Saya telah menggunakan tipe relasi `media_id` merujuk ke tabel `medias` yang Anda sediakan. Apakah penamaan kolom `media_id` di tabel blog & kategori sudah pas dengan preferensi *backend* Anda?
> 2. Karena seluruh tabel telah dirancang dengan *blueprint* Laravel (Eloquent), apakah Anda ingin saya menuliskan **Migration Files** Laravel-nya secara utuh? Atau Anda hanya memerlukan rancangan logika ini untuk diterapkan sendiri di Backend?
