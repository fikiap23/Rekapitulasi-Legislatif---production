Berikut adalah dokumentasi yang menjelaskan penggunaan endpoint-auth:

### Auth API

#### 1. **Sign Up - Admin**

**Endpoint:** `POST /auth/signup`

Mendaftarkan admin baru.

**Request Body:**

```json
{
  "username": "admin123",
  "role": "admin",
  "password": "strongPassword",
  "repassword": "strongPassword"
}
```

- `username` (string): Nama pengguna admin.
- `role` (string, default: "admin"): Peran admin.
- `password` (string): Kata sandi.
- `repassword` (string): Ulangi kata sandi untuk konfirmasi.

**Response:**

```json
{
  "status": "success",
  "code": 201,
  "message": "User account created successfully",
  "data": {
    "_id": "user_id",
    "role": "admin",
    "username": "admin123"
  },
  "error": null
}
```

#### 2. **Login**

**Endpoint:** `POST /auth/login`

Melakukan login pengguna.

**Request Body:**

```json
{
  "username": "admin123",
  "password": "strongPassword"
}
```

- `username` (string): Nama pengguna.
- `password` (string): Kata sandi.

**Response:**

```json
{
  "status": "success",
  "code": 200,
  "message": "Admin logged in successfully",
  "data": {
    "_id": "user_id",
    "role": "admin",
    "username": "admin123"
  },
  "error": null
}
```

#### 3. **Logout**

**Endpoint:** `POST /auth/logout`

Logout pengguna.

**Response:**

```json
{
  "status": "success",
  "code": 200,
  "message": "User logged out successfully",
  "data": null,
  "error": null
}
```

Gunakan endpoint ini untuk mendaftarkan admin, melakukan login, dan logout dari sistem. Pastikan untuk menyertakan informasi yang dibutuhkan dalam request body sesuai dengan kebutuhan.
