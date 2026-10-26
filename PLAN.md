# Plan — Publish Prototype HTML via GitHub Pages (2026-10-26)

> Publish kumpulan prototype single-file HTML ke GitHub Pages (project site) di `https://<username-github>.github.io/prototypes/`, dengan landing page berisi daftar prototype. Tambah/update prototype cukup commit file HTML, deploy otomatis lewat GitHub Actions.
>
> **Latar belakang**: Ada beberapa prototype HTML yang mau dipublish dan akan terus bertambah/berubah. Awalnya didiskusikan lewat VPS (nginx + Traefik, `mock.dhirapratama.online`), diputuskan pakai GitHub Pages tanpa custom domain karena single-file, tanpa kebutuhan password, dan nol maintenance server.
>
> **Source**: direct request

---

## 1. Progress Tracker

| ID | Task | Status | PIC | Catatan |
|----|------|--------|-----|---------|
| **T1** | Init repo `prototypes` + struktur folder + `.gitignore` | `[x]` | - | Nama repo HARUS `prototypes` (menentukan base path URL) |
| **T2** | `scripts/build.js`: scan `prototypes/*.html` → `dist/` + `manifest.json` | `[x]` | - | Node bawaan, tanpa dependency |
| **T3** | `landing/index.html`: fetch `manifest.json`, render list | `[x]` | - | Path relatif saja |
| **T4** | `.github/workflows/deploy.yml`: build + deploy Pages on push `main` | `[x]` | - | Perlu T2, T3 |
| **T5** | Setup GitHub: repo public, Settings → Pages → Source "GitHub Actions" | `[ ]` | - | Manual di GitHub UI |
| **T6** | Masukkan 1 prototype nyata, verifikasi end-to-end | `[ ]` | - | Perlu T1–T5 |
| **T7** | Catat konvensi (cara tambah prototype) di `README.md` + `CLAUDE.md` | `[x]` | - | |

---

## 2. Analysis

Project site GitHub Pages disajikan di subpath `/prototypes/`, bukan root domain. Konsekuensi utama: semua link dan asset harus **relatif**.

| Sebelum | Sesudah | Dampak |
|---------|---------|--------|
| Prototype HTML tersebar lokal, dibagikan manual | Satu URL `https://<username-github>.github.io/prototypes/` + list | Mudah dibagikan dan dicari |
| Tidak ada proses publish | Push `main` → Actions → live | Update tanpa langkah manual |
| (Opsi VPS) butuh nginx/Traefik/DNS | GitHub Pages, tanpa DNS/CNAME | Nol maintenance, tapi tidak ada auth |

**Keputusan:**
- Tanpa custom domain → **jangan buat file `CNAME`**.
- Repo **public** (Pages di plan Free butuh repo public). Semua source HTML ikut terlihat publik, jadi **jangan commit prototype berisi data/desain client sensitif**. Kalau nanti perlu privat, pindah ke opsi VPS + basicauth.
- Landing fetch `manifest.json` (di-generate saat build), tanpa templating.
- Metadata per prototype diambil dari tag `<meta>` di HTML-nya, tanpa file `meta.json` terpisah:
  ```html
  <title>Invoice v1</title>
  <meta name="proto:desc" content="Prototype halaman invoice">
  <meta name="proto:date" content="2026-10-26">
  <meta name="proto:tags" content="invoice,finance">
  ```
  Fallback bila tidak ada: title dari `<title>`, tanggal dari mtime file, desc kosong.
- Slug = nama file tanpa `.html`. Dipilih sekali dan tidak diubah, supaya link yang sudah dibagikan tidak putus.

**Struktur target:**
```
prototypes/
├── prototypes/            # source: 1 file HTML per prototype
│   └── invoice-v1.html
├── landing/index.html
├── scripts/build.js
├── .github/workflows/deploy.yml
├── PLAN.md
├── README.md
└── CLAUDE.md
```
`dist/` (hasil build, tidak di-commit): `index.html`, `manifest.json`, `invoice-v1.html`, ...

## 3. Implementation Notes

### `scripts/build.js`
- Baca semua `prototypes/*.html`, ekstrak `<title>` dan meta `proto:*` pakai regex sederhana.
- Tulis `dist/manifest.json`: array `{ slug, file, title, desc, date, tags }` diurutkan `date` desc.
- Copy `prototypes/*.html` dan `landing/index.html` ke `dist/`. Tambah `dist/.nojekyll` dan `dist/robots.txt` (`Disallow: /`) + beri catatan ke README bahwa ini hanya imbauan, bukan proteksi.
- Beri self-check kecil: exit non-zero kalau ada slug duplikat atau tidak ada HTML sama sekali.

### `landing/index.html`
- Satu file, `fetch('./manifest.json')` (relatif, tanpa leading slash), render kartu: title, desc, tanggal, tag, link `./<slug>.html`.
- Search/filter tag sederhana, hanya bila murah. Kalau tidak, skip dulu.
- Fallback teks bila manifest gagal dimuat atau kosong.

### `.github/workflows/deploy.yml`
- Trigger: `push` ke `main` + `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Steps: `actions/checkout` → `actions/setup-node` → `node scripts/build.js` → `actions/upload-pages-artifact` (path `dist`) → `actions/deploy-pages`.
- Pin versi action ke major terbaru yang tersedia saat implementasi (cek dulu, jangan asal dari ingatan).

### `README.md` / `CLAUDE.md`
- Cara tambah prototype: taruh `prototypes/<slug>.html` + meta tag, commit, push.
- Aturan wajib: asset eksternal pakai URL absolut (CDN), asset lokal pakai path relatif, tanpa `/` di depan.
- `CLAUDE.md` mencatat: plan docs di root `PLAN.md`, dan konvensi branch `feat/` / `fix/`.

## 4. Testing / Verification

- [ ] `node scripts/build.js` jalan lokal, `dist/` berisi landing + manifest + semua prototype.
- [ ] Preview lokal dari subpath: `mkdir -p /tmp/p && ln -s "$PWD/dist" /tmp/p/prototypes && python3 -m http.server -d /tmp/p` → buka `http://localhost:8000/prototypes/`. Landing render, link tiap prototype terbuka, tidak ada 404.
- [ ] Build gagal dengan pesan jelas bila slug duplikat atau folder prototype kosong.
- [ ] Workflow sukses di tab Actions setelah push `main`.
- [ ] `https://<username-github>.github.io/prototypes/` menampilkan list, dan salah satu prototype terbuka lewat link landing.
- [ ] Tambah prototype kedua → push → muncul di list tanpa ubah file lain.
- [ ] Cek browser console di URL live: tidak ada error 404 asset atau mixed content.

## 5. Open Items

- Username GitHub dan org/akun tujuan repo belum ditentukan (placeholder `<username-github>`).
- Konfirmasi tidak ada prototype sensitif yang ikut dipublish (repo public).
- Syarat Pages/limit di plan Free belum diverifikasi ke dokumentasi GitHub terbaru, cek saat T5.
