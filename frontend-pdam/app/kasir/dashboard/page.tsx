/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import SidebarKasir from "@/components/Kasir/SidebarKasir"
import { getAuthToken, getUserRole } from "@/utils/cookies"
import { 
    Menu, 
    Droplets, 
    UserPlus, 
    CheckCircle, 
    ChevronRight, 
    Calculator,
    Info
} from "lucide-react"

interface Pelanggan {
    id: string
    name: string
    email: string
}

export default function KasirDashboard() {
    // --- STATE PENCATATAN TAGIHAN ---
    const [form, setForm] = useState({
        userId: "",
        bulan: "Januari",
        tahun: new Date().getFullYear(),
        meter_awal: 0,
        meter_akhir: 0
    })

    // --- STATE UMUM ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [kasirName, setKasirName] = useState("")
    const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
    
    const router = useRouter()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // --- FUNGSI AMBIL DATA PELANGGAN ---
    const fetchPelanggan = useCallback(async () => {
        try {
            const currentToken = getAuthToken();
            const res = await fetch(`${API_URL}/users/pelanggan`, {
                headers: { "Authorization": `Bearer ${currentToken}` }
            })
            const data = await res.json()
            if (data.status) setPelanggan(data.data)
        } catch (error) {
            toast.error("Gagal memuat data pelanggan")
        }
    }, [API_URL])

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()
        const name = localStorage.getItem("name")

        if (!token || role !== "KASIR") {
            router.push("/login")
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (name) setKasirName(name)
        fetchPelanggan()
    }, [router, fetchPelanggan])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.meter_akhir < form.meter_awal) {
            toast.error("Meter akhir tidak boleh lebih kecil!")
            return
        }
        const loadingToast = toast.loading("Menyimpan tagihan...")
        try {
            const res = await fetch(`${API_URL}/tagihan`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${getAuthToken()}` 
                },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            toast.dismiss(loadingToast)
            if (data.status) {
                toast.success("Tagihan Berhasil Dibuat!")
                setForm({ ...form, meter_awal: 0, meter_akhir: 0 })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error("Error koneksi server")
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        router.push('/')
    }

    // Kalkulasi Biaya
    const totalPemakaian = Math.max(0, form.meter_akhir - form.meter_awal)
    const estimasiBiaya = totalPemakaian * 5000

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            <Toaster position="top-center" />

            {/* Sidebar (Persistent di Desktop) */}
            <SidebarKasir 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                onLogout={handleLogout} 
            />

            {/* Konten Utama (Margin kiri 72 di desktop) */}
            <main className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
                
                {/* Header / Navbar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">Input Tagihan Air</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Petugas: {kasirName}</p>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
                    
                    {/* Banner Informasi Singkat */}
                    <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-2">Pencatatan Meteran Digital</h2>
                            <p className="text-blue-100 text-sm max-w-md leading-relaxed">Pastikan angka meteran yang diinput sesuai dengan foto atau bukti fisik dari lapangan untuk menghindari komplain pelanggan.</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 relative z-10 text-center min-w-[150px]">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Tarif Per m³</p>
                            <p className="text-2xl font-black">Rp 5.000</p>
                        </div>
                        {/* Dekorasi Abstract */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Form Input (Kiri/Utama) */}
                        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <Calculator size={18} className="text-blue-600" /> 
                                    Data Penggunaan Air
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Nama Pelanggan</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                                        value={form.userId}
                                        onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Cari & Pilih Pelanggan --</option>
                                        {pelanggan.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Bulan Tagihan</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                            value={form.bulan}
                                            onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                        >
                                            {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Tahun</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                            value={form.tahun}
                                            onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Meteran Lalu (m³)</label>
                                        <input
                                            type="number"
                                            className="w-full p-5 bg-slate-100/50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-400 outline-none cursor-not-allowed"
                                            value={form.meter_awal}
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 block">Meteran Baru (m³)</label>
                                        <input
                                            type="number"
                                            className="w-full p-5 bg-white border-2 border-blue-600 rounded-2xl text-2xl font-black text-slate-800 outline-none shadow-xl shadow-blue-50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                            value={form.meter_akhir}
                                            onChange={(e) => setForm({ ...form, meter_akhir: Number(e.target.value) || 0 })}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3">
                                    Simpan Tagihan <ChevronRight size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Ringkasan & Pintasan (Kanan) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Kartu Kalkulasi Realtime */}
                            <div className="bg-slate-900 rounded-[2rem] p-1 shadow-2xl">
                                <div className="bg-slate-800 border border-white/5 rounded-[1.8rem] p-6 space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Penggunaan</p>
                                        <p className="text-4xl font-black text-white">{totalPemakaian} <span className="text-sm font-medium text-slate-500">m³</span></p>
                                    </div>
                                    <div className="h-px bg-slate-700"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Estimasi Tagihan</p>
                                        <p className="text-3xl font-black text-emerald-400">
                                            <span className="text-sm font-normal mr-1 italic text-emerald-600">Rp</span>
                                            {estimasiBiaya.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pintasan Menu Lain */}
                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Aksi Cepat</p>
                                <button onClick={() => router.push('/kasir/pelanggan')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UserPlus size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Input Pelanggan</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                                </button>

                                <button onClick={() => router.push('/kasir/verifikasi')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CheckCircle size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Verifikasi Bayar</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-700 leading-relaxed font-medium italic">
                                    Data meteran yang sudah disimpan akan otomatis muncul di dashboard pelanggan untuk ditagihkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}