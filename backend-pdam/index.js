const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();
const SECRET = "pdam_super_secret_123";

app.use(cors());
app.use(express.json());

// Buka akses folder 'uploads' agar gambar bisa dilihat
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SETUP UPLOAD GAMBAR (MULTER) ---
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'bukti-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// ==========================================
// 1. MODULE USER & AUTH
// ==========================================

// Register
app.post('/user', async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { name, email, password: hashPassword, address, role }
        });
        res.json({ status: true, message: "User Berhasil Dibuat" });
    } catch (err) {
        res.status(400).json({ status: false, message: "Email sudah dipakai" });
    }
});

// Login
app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ status: false, message: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: false, message: "Password salah" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ status: true, token, data: user });
});

// Ambil Profil User
app.get('/user/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            select: { name: true, email: true, address: true, role: true }
        });
        res.json({ status: true, data: user });
    } catch (err) { res.status(500).json({ status: false }); }
});

// Ambil List Pelanggan
app.get('/users/pelanggan', async (req, res) => {
    const data = await prisma.user.findMany({ where: { role: 'PELANGGAN' } });
    res.json({ status: true, data });
});


// ==========================================
// 2. MODULE TAGIHAN & PEMBAYARAN
// ==========================================

// KASIR: Input Tagihan Baru
app.post('/tagihan', async (req, res) => {
    try {
        const { userId, bulan, tahun, meter_awal, meter_akhir } = req.body;

        const cek = await prisma.tagihan.findFirst({
            where: { userId: parseInt(userId), bulan: bulan, tahun: parseInt(tahun) }
        });
        if (cek) return res.status(400).json({ status: false, message: "Tagihan bulan ini sudah ada!" });

        const total = (parseInt(meter_akhir) - parseInt(meter_awal)) * 5000;
        const data = await prisma.tagihan.create({
            data: {
                userId: parseInt(userId),
                bulan,
                tahun: parseInt(tahun),
                meter_awal: parseInt(meter_awal),
                meter_akhir: parseInt(meter_akhir),
                total_bayar: total,
                status_bayar: "BELUM_BAYAR"
            }
        });
        res.json({ status: true, message: "Sukses", data });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});

// PELANGGAN: Lihat Tagihan Saya
app.get('/tagihan/:userId', async (req, res) => {
    const data = await prisma.tagihan.findMany({
        where: { userId: parseInt(req.params.userId) },
        orderBy: { id: 'desc' }
    });
    res.json({ status: true, data });
});

// PELANGGAN: Upload Bukti Bayar
app.post('/tagihan/upload/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ status: false, message: "File gambar wajib diisi" });

        await prisma.tagihan.update({
            where: { id: parseInt(id) },
            data: {
                status_bayar: "MENUNGGU_VERIFIKASI",
                bukti_bayar: req.file.filename
            }
        });
        res.json({ status: true, message: "Bukti terkirim" });
    } catch (err) {
        res.status(500).json({ status: false, message: "Gagal upload" });
    }
});

// KASIR: Lihat Tagihan Verifikasi
app.get('/tagihan/verifikasi/list', async (req, res) => {
    const data = await prisma.tagihan.findMany({
        where: { status_bayar: "MENUNGGU_VERIFIKASI" },
        include: { user: true }
    });
    const formatted = data.map(item => ({
        id: item.id,
        userName: item.user.name,
        bulan: item.bulan,
        tahun: item.tahun,
        total_bayar: item.total_bayar,
        bukti_bayar: item.bukti_bayar
    }));
    res.json({ status: true, data: formatted });
});

// KASIR: Eksekusi Verifikasi
app.put('/tagihan/verifikasi/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { aksi } = req.body;
        const status = aksi === 'TERIMA' ? "LUNAS" : "BELUM_BAYAR";
        const updateData = aksi === 'TERIMA' ? { status_bayar: status } : { status_bayar: status, bukti_bayar: null };

        await prisma.tagihan.update({ where: { id: parseInt(id) }, data: updateData });
        res.json({ status: true, message: aksi === 'TERIMA' ? "Lunas" : "Ditolak" });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});

// ==========================================
// 3. KHUSUS MANAGER (DASHBOARD STATISTIK)
// ==========================================

// Endpoint Dashboard (UPDATED: Ada Unread Count)
app.get('/manager/dashboard', async (req, res) => {
    try {
        // 1. Ambil Tagihan untuk hitung statistik keuangan
        const tagihan = await prisma.tagihan.findMany({
            include: { user: true },
            orderBy: { id: 'desc' }
        });

        // 2. Hitung jumlah pelanggan
        const totalPelanggan = await prisma.user.count({ where: { role: 'PELANGGAN' } });

        // 3. Hitung Pesan Belum Dibaca (FITUR BARU)
        const unreadCount = await prisma.pengaduan.count({
            where: { isRead: false }
        });

        let pendapatan = 0;
        let belumBayar = 0;
        let sudahLunas = 0;
        let totalAir = 0;

        tagihan.forEach(t => {
            // Hitung Debit Air (Meter Akhir - Meter Awal)
            const debit = t.meter_akhir - t.meter_awal;
            totalAir += debit;

            if (t.status_bayar === 'LUNAS') {
                pendapatan += t.total_bayar;
                sudahLunas++;
            } else {
                belumBayar++;
            }
        });

        res.json({
            status: true,
            stats: {
                total_pendapatan: pendapatan,
                total_pelanggan: totalPelanggan,
                transaksi_lunas: sudahLunas,
                transaksi_tunggakan: belumBayar,
                total_air: totalAir,
                unread_pengaduan: unreadCount // <--- Dikirim ke frontend untuk notifikasi merah
            },
            data: tagihan
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});


// ==========================================
// 4. FITUR PENGADUAN (CONTACT FORM)
// ==========================================

// PUBLIC: Orang kirim pesan (Create)
app.post('/pengaduan', async (req, res) => {
    try {
        const { nama, email, pesan } = req.body;
        // isRead otomatis false (default di database)
        const newPengaduan = await prisma.pengaduan.create({
            data: { nama, email, pesan }
        });
        res.json({ status: true, message: "Pesan terkirim!", data: newPengaduan });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal kirim pesan" });
    }
});

// MANAGER ONLY: Baca pesan & Tandai sudah dibaca (Read & Update)
app.get('/manager/pengaduan', async (req, res) => {
    try {
        // 1. Ambil semua pesan
        const list = await prisma.pengaduan.findMany({
            orderBy: { createdAt: 'desc' } // Pesan terbaru di atas
        });

        // 2. UPDATE STATUS: Tandai semua pesan 'unread' menjadi 'read'
        // Karena manager sedang membuka halaman inbox ini
        await prisma.pengaduan.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });

        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal ambil data" });
    }
});

// MANAGER ONLY: Hapus Pesan
app.delete('/manager/pengaduan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pengaduan.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: true, message: "Pesan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal menghapus pesan" });
    }
});

// GANTI BAGIAN PALING BAWAH INDEX.JS DENGAN INI:

// Export app untuk Vercel (Wajib serverless)
module.exports = app;

// Hanya jalankan app.listen kalau BUKAN di Vercel (untuk tes lokal di laptop)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server PDAM jalan di port ${PORT}`);
    });
}