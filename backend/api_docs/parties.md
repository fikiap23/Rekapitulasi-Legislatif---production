### Endpoint Pembuatan Partai Secara Massal

Dokumentasi ini menjelaskan penggunaan endpoint untuk membuat partai secara massal pada aplikasi Express.js Anda.

#### Buat Partai Secara Massal

**Endpoint:** `POST /parties/bulk`

Endpoint ini memungkinkan Anda membuat beberapa partai sekaligus. Akses ke endpoint ini dilindungi dan memerlukan hak admin (dilindungi oleh middleware `protectAdminRoute`).

**Contoh Permintaan:**

```bash
curl -X POST http://url-api-anda/parties/bulk \
  -H "Authorization: Bearer TOKEN_ADMIN_ANDA" \
  -H "Content-Type: application/json" \
  -d '[
  {
    "code": "ABC",
    "name": "Partai Contoh 1",
    "number_party": 1,
    "path": "/partai-contoh-1",
    "logoUrl": "https://contoh.com/logo1.png",
    "dapil": [
      {
        "number_dapil": 1,
        "candidates": [
          {
            "name": "John Doe",
            "gender": "Pria"
          }
        ]
      }
    ]
  },
  {
    "code": "DEF",
    "name": "Partai Contoh 2",
    "number_party": 2,
    "path": "/partai-contoh-2",
    "logoUrl": "https://contoh.com/logo2.png",
    "dapil": [
      {
        "number_dapil": 2,
        "candidates": [
          {
            "name": "Jane Doe",
            "gender": "Wanita"
          }
        ]
      }
    ]
  }
]
'
```

**Contoh Respons Sukses:**

```json
{
  "status": "success",
  "code": 201,
  "message": "Partai berhasil dibuat",
  "data": [
    {
      // ... Detail partai yang pertama dibuat
    }
    // ... Detail partai lainnya yang dibuat
  ],
  "error": null
}
```

**Contoh Respons Gagal:**

```json
{
  "status": "error",
  "code": 400,
  "message": "Satu atau lebih partai sudah ada",
  "error": {
    "type": "Validation",
    "details": "Satu atau lebih partai sudah ada"
  }
}
```

Pastikan untuk menggantikan `http://url-api-anda` dengan URL dasar API Anda dan pastikan Anda memiliki token admin yang valid untuk membuat partai secara massal.

Silakan sesuaikan contoh ini berdasarkan struktur API sebenarnya dan kebutuhan aplikasi Anda.
