# ✨ TypoDetector — Deteksi Typo Cerdas untuk Teks Akademik

TypoDetector adalah aplikasi berbasis web yang dibangun menggunakan **Python Flask** dan **Tailwind CSS** untuk membantu pengguna mendeteksi kesalahan penulisan (typo) pada teks, khususnya dalam konteks laporan, dokumen akademik, atau tugas akhir.

🚀 Proyek ini mendukung upload file teks (`.txt`, `.docx`, `.pdf`) maupun input manual, serta memberikan saran kata yang benar berdasarkan kamus kata Bahasa Indonesia.

---

## 🛠️ Teknologi yang Digunakan

- 🐍 Python 3.x
- 🔥 Flask (Micro Web Framework)
- 🎨 Tailwind CSS v4 (dengan build NPM)
- 💡 JavaScript Vanilla
- 📚 Jinja2 Template Engine
- 🧠 Difflib (`get_close_matches`) untuk logika typo detection
- 📄 python-docx, PyPDF2 untuk parsing file dokumen

---

## 🎯 Fitur Utama

- ✅ Deteksi typo dari teks manual atau file upload
- ✅ Mendukung format `.txt`, `.docx`, dan `.pdf`
- ✅ Menampilkan saran kata yang benar
- ✅ Antarmuka modern dan responsive dengan Tailwind CSS
- ✅ Live reload saat development (menggunakan `livereload`)
- ✅ Backend modular dan clean
