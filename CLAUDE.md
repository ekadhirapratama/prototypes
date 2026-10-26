# prototypes — Repo Instructions

Kumpulan prototype single-file HTML, dipublish ke GitHub Pages (`<username-github>.github.io/prototypes`).

## Plan docs

- Plan doc ada di root repo: `PLAN.md`.

## Konvensi prototype

- Cara tambah prototype dan aturan asset: lihat `README.md`. Wajib ada `<meta name="proto:date">`.
- Asset lokal pakai path relatif tanpa `/` di depan (situs di subpath `/prototypes/`).

## Git Rules (override global)

Repo ini cuma prototype, jadi **boleh add/commit/push langsung ke `main`** tanpa bikin branch dan tanpa PR. Ini override rule global "dilarang commit di `main`". Berlaku hanya untuk repo ini.

Repo ini **public** — apapun yang di-commit langsung terlihat publik. Karena itu, **wajib scan data sensitif sebelum setiap `git add`/`git commit`**.

### Pre-commit sensitive data check (wajib)

1. Scan semua file yang akan di-commit (`git status` / `git diff`, atau file baru) untuk:
   - Identitas: NIK/KTP, nama orang, alamat, no. HP, email, tanggal lahir, no. rekening/kartu
   - Kredensial: API key, token, password, secret, private key, connection string, `.env`
   - Data client/bisnis: nama client, harga/kontrak, data keuangan, URL internal/staging, IP internal
   - Foto/gambar/dokumen asli yang di-embed (base64 atau file)
2. **Tidak ada temuan** → lanjut commit, sebutkan singkat hasil scan di balasan.
3. **Ada temuan** → **STOP, jangan add/commit**. Tampilkan file:baris + jenis datanya, lalu tanya user: data ini **dummy atau real**?
   - **Dummy** (sudah di-mask, placeholder, `Contoh ...`, `****`) → lanjut commit setelah user konfirmasi.
   - **Real** → jangan commit. Minta user mask/ganti dulu, atau keluarkan file dari repo.
   - **Ragu** → anggap real sampai user konfirmasi.
4. Konfirmasi berlaku per commit. Jangan asumsi dari konfirmasi sebelumnya kalau ada file/data baru.

Jangan `git push --force` ke `main`, dan jangan rewrite history tanpa izin eksplisit. Data yang sudah ke-push ke repo public dianggap bocor permanen.

## Konvensi branch

Default `main` langsung. Kalau user eksplisit minta branch/PR, pakai `feat/` atau `fix/`.
