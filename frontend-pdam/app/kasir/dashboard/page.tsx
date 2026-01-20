"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

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
    const [kasirName, setKasirName] = useState("") // Nama Kasir yang login
    const router = useRouter()

    useEffect(() => {
        // --- 1. PROTEKSI ROLE & AUTH ---
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")
        const name = localStorage.getItem("name")

        // Cek Login
        if (!token) {
            router.push("/login")
            return
        }

        // Cek Role
        if (role !== "KASIR") {
            if (role === "MANAGER") {
                router.push("/manager/dashboard")
                return
            }
            if (role === "PELANGGAN") {
                router.push("/pelanggan/dashboard")
                return
            }
            localStorage.clear()
            router.push("/login")
            return
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (name) setKasirName(name)

        // --- 2. FETCH DATA PELANGGAN ---
        const fetchPelanggan = async () => {
            try {
                const res = await fetch('http://localhost:8000/users/pelanggan', {
                    headers: {
                        // Kirim token biar backend tau request valid
                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (data.status) setPelanggan(data.data)
            } catch (error) {
                console.error("Gagal ambil data pelanggan", error)
            }
        }
        fetchPelanggan()
    }, [router])

    // Fungsi Submit Tagihan Baru
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validasi Sederhana
        if (form.meter_akhir < form.meter_awal) {
            toast.error("Meter akhir tidak boleh kurang dari meter awal.")
            return
        }

        const token = localStorage.getItem("token")

        try {
            const res = await fetch('http://localhost:8000/tagihan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Auth Header
                },
                body: JSON.stringify(form)
            })
            const data = await res.json()

            if (data.status) {
                toast.success("Tagihan Berhasil Dibuat!")
                // Reset form meteran saja, user/bulan biarkan biar cepat input beruntun
                setForm({ ...form, meter_awal: 0, meter_akhir: 0 })
            } else {
                toast.error("Gagal: " + data.message)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Error koneksi server")
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-10">
            {/* --- NAVBAR KASIR --- */}
            <nav className="bg-sky-800 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center px-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-white text-sky-800 w-8 h-8 flex items-center justify-center rounded font-bold">K</div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">KASIR PDAM</h1>
                            <p className="text-[10px] text-sky-200">Panel Pembayaran</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden md:block">Halo, {kasirName}</span>
                        <button
                            onClick={() => { localStorage.clear(); router.push('/login') }}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto p-6 md:p-10 max-w-5xl">

                {/* --- MENU NAVIGASI --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Kotak 1: Input Tagihan (Aktif Sekarang) */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-sky-500 flex items-center justify-between ring-2 ring-sky-100">
                        <div>
                            <h2 className="text-xl font-bold text-sky-800">📝 Input Tagihan</h2>
                            <p className="text-sm text-gray-500">Catat penggunaan air pelanggan</p>
                        </div>
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-xl">👇</div>
                    </div>

                    {/* Kotak 2: Tombol ke Halaman Verifikasi */}
                    <button
                        onClick={() => router.push('/kasir/verifikasi')}
                        className="bg-white hover:bg-yellow-50 p-6 rounded-2xl shadow-sm border-l-4 border-transparent hover:border-yellow-400 transition flex items-center justify-between group cursor-pointer text-left"
                    >
                        <div>
                            <h2 className="text-xl font-bold text-gray-700 group-hover:text-yellow-700">🔍 Cek Pembayaran</h2>
                            <p className="text-sm text-gray-500">Verifikasi bukti transfer</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-yellow-100 rounded-full flex items-center justify-center text-xl transition">👉</div>
                    </button>
                </div>


                {/* --- FORM INPUT TAGIHAN --- */}
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-sky-400 to-blue-600"></div>

                    <h3 className="text-2xl font-black text-center mb-8 text-slate-700 tracking-tight">
                        INPUT TAGIHAN BARU
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Pilih Pelanggan */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-slate-600">Pilih Pelanggan</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3 pl-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none appearance-none font-medium"
                                    value={form.userId}
                                    title="Pilih Pelanggan"
                                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Cari Nama Pelanggan --</option>
                                    {pelanggan.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Pilih Bulan & Tahun */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-600">Bulan</label>
                                <select
                                    title="input"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={form.bulan}
                                    onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                >
                                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-600">Tahun</label>
                                <input
                                    type="number"
                                    title="input"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={form.tahun}
                                    onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Input Meteran */}
                        <div className="grid grid-cols-2 gap-4 bg-sky-50 p-5 rounded-xl border border-sky-100 mt-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-sky-800 uppercase tracking-wide">Meter Awal</label>
                                <input
                                    title="input"
                                    type="number"
                                    className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono text-lg font-bold text-slate-700"
                                    value={form.meter_awal}
                                    onChange={(e) => setForm({ ...form, meter_awal: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-sky-800 uppercase tracking-wide">Meter Akhir</label>
                                <input
                                    title="input"
                                    type="number"
                                    className="w-full p-3 border border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 font-mono text-lg font-bold text-slate-700"
                                    value={form.meter_akhir}
                                    onChange={(e) => setForm({ ...form, meter_akhir: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Info Total (Otomatis) */}
                        <div className="flex justify-between items-end border-t border-dashed border-slate-300 pt-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Total Pemakaian</p>
                                <p className="font-bold text-slate-700">
                                    {Math.max(0, form.meter_akhir - form.meter_awal)} m³
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Estimasi Tagihan:</p>
                                <p className="text-3xl font-black text-sky-600">
                                    Rp {Math.max(0, (form.meter_akhir - form.meter_awal) * 5000).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.99] mt-6 flex justify-center items-center gap-2">
                            <span>💾</span> SIMPAN TAGIHAN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}