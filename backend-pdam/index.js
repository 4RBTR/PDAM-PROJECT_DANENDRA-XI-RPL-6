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

// ==========================================
// 🔴 PENGATURAN KONEKSI (CORS) - PENTING!
// ==========================================
// Kita izinkan SEMUA alamat (*) supaya Frontend di HP/Laptop lain bisa masuk.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Penting untuk membaca JSON body

// Buka akses folder 'uploads' agar gambar bisa dilihat di Frontend
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

app.get('/manager/dashboard', async (req, res) => {
    try {
        const tagihan = await prisma.tagihan.findMany({
            include: { user: true },
            orderBy: { id: 'desc' }
        });

        const totalPelanggan = await prisma.user.count({ where: { role: 'PELANGGAN' } });
        const unreadCount = await prisma.pengaduan.count({
            where: { isRead: false }
        });

        let pendapatan = 0;
        let belumBayar = 0;
        let sudahLunas = 0;
        let totalAir = 0;

        tagihan.forEach(t => {
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
                unread_pengaduan: unreadCount
            },
            data: tagihan
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message });
    }
});


// ==========================================
// 4. FITUR PENGADUAN
// ==========================================

// KONTAK TAMU
app.post('/contact', async (req, res) => {
    try {
        const { nama, email, pesan } = req.body;
        if (!nama || !email || !pesan) {
            return res.status(400).json({ status: false, message: "Data tidak lengkap" });
        }

        const data = await prisma.pengaduan.create({
            data: {
                userId: null,
                nama: nama,
                email: email,
                judul: `Pesan Tamu: ${nama}`,
                deskripsi: pesan,
                status: "PENDING",
                isRead: false,
                isDeletedByUser: false
            }
        });

        res.json({ status: true, message: "Pesan tamu berhasil disimpan", data });
    } catch (error) {
        console.error("Error Contact:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

// USER/PELANGGAN: Kirim Pengaduan (Dengan Gambar)
app.post('/pengaduan', upload.single('image'), async (req, res) => {
    try {
        const { user_id, nama, email, judul, deskripsi } = req.body;

        const fotoName = req.file ? req.file.filename : null;
        const userIdInt = (user_id && user_id !== 'undefined' && user_id !== 'null') ? parseInt(user_id) : null;

        const data = await prisma.pengaduan.create({
            data: {
                userId: userIdInt,
                nama: userIdInt ? undefined : nama,
                email: userIdInt ? undefined : email,
                judul: judul,
                deskripsi: deskripsi,
                foto: fotoName,
                status: "PENDING"
            }
        });

        res.json({ status: true, message: "Pengaduan terkirim!", data });
    } catch (error) {
        console.log("Error Pengaduan:", error);
        res.status(500).json({ status: false, message: "Gagal kirim pengaduan" });
    }
});

// PELANGGAN: Riwayat Pengaduan
app.get('/pengaduan/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const list = await prisma.pengaduan.findMany({
            where: {
                userId: parseInt(id),
                isDeletedByUser: false
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal ambil data" });
    }
});

// PELANGGAN: Hapus (Soft Delete)
app.delete('/pengaduan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pengaduan.update({
            where: { id: parseInt(id) },
            data: { isDeletedByUser: true }
        });
        res.json({ status: true, message: "Laporan berhasil dihapus dari riwayat" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal menghapus laporan" });
    }
});

// MANAGER: Lihat Semua Pengaduan
app.get('/manager/pengaduan', async (req, res) => {
    try {
        const list = await prisma.pengaduan.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        await prisma.pengaduan.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });

        res.json({ status: true, data: list });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal ambil data" });
    }
});

// MANAGER: Balas
app.put('/manager/pengaduan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, tanggapan } = req.body;
        await prisma.pengaduan.update({
            where: { id: parseInt(id) },
            data: { status, tanggapan }
        });
        res.json({ status: true, message: "Status & Tanggapan diperbarui" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal update" });
    }
});

// MANAGER: Hapus Permanen
app.delete('/manager/pengaduan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.pengaduan.delete({ where: { id: parseInt(id) } });
        res.json({ status: true, message: "Pesan berhasil dihapus permanen" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Gagal menghapus pesan" });
    }
});


// ==========================================
// EXPORT SERVER
// ==========================================

module.exports = app;

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8000;
    // 🔴 PENTING: Listen ke '0.0.0.0' supaya bisa diakses dari jaringan (IP) lain
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server PDAM jalan di port ${PORT} dan terbuka untuk semua IP`);
    });
}