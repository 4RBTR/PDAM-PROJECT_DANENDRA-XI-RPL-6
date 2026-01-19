"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function KasirDashboard() {
    // State untuk form input tagihan
    const [form, setForm] = useState({
        userId: "",
        bulan: "Januari",
        tahun: new Date().getFullYear(),
        meter_awal: 0,
        meter_akhir: 0
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pelanggan, setPelanggan] = useState<any[]>([])
    const router = useRouter()

    // Ambil daftar pelanggan untuk dropdown
    useEffect(() => {
        const fetchPelanggan = async () => {
            const res = await fetch('http://localhost:8000/users/pelanggan')
            const data = await res.json()
            if (data.status) setPelanggan(data.data)
        }
        fetchPelanggan()
    }, [])

    // Fungsi Submit Tagihan Baru
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:8000/tagihan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.status) {
                alert("✅ Tagihan Berhasil Dibuat!")
                // Reset form meteran saja, user/bulan biarkan biar cepat
                setForm({ ...form, meter_awal: 0, meter_akhir: 0 })
            } else {
                alert("❌ Gagal: " + data.message)
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Error koneksi server")
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            {/* --- NAVBAR KASIR --- */}
            <nav className="bg-sky-800 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-black italic">👮 KASIR PDAM</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { localStorage.clear(); router.push('/login') }}
                            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg text-sm font-bold transition"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto p-6 md:p-10">

                {/* --- MENU NAVIGASI (PENTING: INI HUBUNGANNYA) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Kotak 1: Input Tagihan (Aktif Sekarang) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-sky-500 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-sky-800">📝 Input Tagihan</h2>
                            <p className="text-sm text-gray-500">Buat tagihan bulanan baru</p>
                        </div>
                        <span className="text-3xl">👇</span>
                    </div>

                    {/* Kotak 2: Tombol ke Halaman Verifikasi */}
                    <button
                        onClick={() => router.push('/kasir/verifikasi')}
                        className="bg-white hover:bg-yellow-50 p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-yellow-400 transition flex items-center justify-between group cursor-pointer text-left"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-gray-700 group-hover:text-yellow-700">🔍 Cek Pembayaran</h2>
                            <p className="text-sm text-gray-500">Verifikasi bukti transfer pelanggan</p>
                        </div>
                        <span className="text-3xl group-hover:scale-110 transition">👉</span>
                    </button>
                </div>


                {/* --- FORM INPUT TAGIHAN --- */}
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto border border-gray-100">
                    <h3 className="text-2xl font-black text-center mb-8 text-slate-700">INPUT TAGIHAN BARU</h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Pilih Pelanggan */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Pilih Pelanggan</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                required
                            >
                                <option value="">-- Cari Nama Pelanggan --</option>
                                {pelanggan.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - {p.email}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pilih Bulan & Tahun */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Bulan</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                                    value={form.bulan}
                                    onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                >
                                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Tahun</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                                    value={form.tahun}
                                    onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Input Meteran */}
                        <div className="grid grid-cols-2 gap-4 bg-sky-50 p-4 rounded-xl border border-sky-100">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-sky-800">Meter Awal</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-500"
                                    value={form.meter_awal}
                                    onChange={(e) => setForm({ ...form, meter_awal: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-sky-800">Meter Akhir</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-500"
                                    value={form.meter_akhir}
                                    onChange={(e) => setForm({ ...form, meter_akhir: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Info Total (Otomatis) */}
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Estimasi Tagihan:</p>
                            <p className="text-2xl font-black text-green-600">
                                Rp {((form.meter_akhir - form.meter_awal) * 5000).toLocaleString('id-ID')}
                            </p>
                        </div>

                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">
                            SIMPAN TAGIHAN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}