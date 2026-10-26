# prototypes

Kumpulan prototype single-file HTML, dipublish ke GitHub Pages: https://ekadhirapratama.github.io/prototypes/

Push ke `main` → GitHub Actions build `dist/` → deploy otomatis.

## Tambah prototype

1. Taruh file di `prototypes/<slug>.html`. Slug = nama file, jangan diganti setelah dibagikan (link putus). `index` dan `manifest` reserved.
2. Tambah meta di `<head>`:
   ```html
   <title>Invoice v1</title>
   <meta name="proto:desc" content="Prototype halaman invoice">
   <meta name="proto:date" content="2026-10-26">   <!-- wajib, YYYY-MM-DD -->
   <meta name="proto:tags" content="invoice,finance">
   ```
3. Commit, push ke `main`.

## Aturan wajib

- Asset eksternal pakai URL absolut (CDN). Asset lokal pakai path relatif, **tanpa `/` di depan** (situs ada di subpath `/prototypes/`).
- Repo **public**: jangan commit data/desain client sensitif atau data pribadi asli. Pakai data dummy/mask.
- `robots.txt` (`Disallow: /`) hanya imbauan ke crawler, **bukan proteksi**. Siapa pun dengan URL bisa buka.

## Build & preview lokal

```bash
node scripts/build.js
mkdir -p /tmp/p && ln -sfn "$PWD/dist" /tmp/p/prototypes && python3 -m http.server -d /tmp/p
# buka http://localhost:8000/prototypes/
```

Build gagal bila: tidak ada HTML, slug duplikat/reserved, atau `proto:date` kosong/format salah.
