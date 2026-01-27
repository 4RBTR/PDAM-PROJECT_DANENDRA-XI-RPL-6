/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import SidebarUser from "@/components/Kasir/SidebarKasir"

// 👇 1. Import Helper Cookies
import { getAuthToken, getUserRole } from "@/utils/cookies"

export default function KasirDashboard() {
    // --- STATE ---
    const [form, setForm] = useState({
        userId: "",
        bulan: "Januari",
        tahun: new Date().getFullYear(),
        meter_awal: 0,
        meter_akhir: 0
    })

    // --- STATE ---
    // 👇 2. State untuk mengatur Sidebar Buka/Tutup
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const [profile, setProfile] = useState<| null>(null)
    const [name, setName] = useState("")
    const [userId, setUserId] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadingId, setUploadingId] = useState<number | null>(null)
    const [greeting, setGreeting] = useState("")


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pelanggan, setPelanggan] = useState<any[]>([])
    const [kasirName, setKasirName] = useState("")

    // State untuk Modal Data Pelanggan
    const [showModalPelanggan, setShowModalPelanggan] = useState(false)

    const router = useRouter()

    // 👇 Helper untuk mengambil Base URL API dari .env.local
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    useEffect(() => {
        // PERBAIKAN 1: Bersihkan semua toast/notifikasi sisa dari halaman login
        toast.dismiss()

        const token = getAuthToken()
        const role = getUserRole()
        const name = localStorage.getItem("name")

        if (!token) {
            router.push("/login")
            return
        }

        if (role !== "KASIR") {
            if (role === "MANAGER") router.push("/manager/dashboard")
            else if (role === "PELANGGAN") router.push("/pelanggan/dashboard")
            else {
                localStorage.clear()
                router.push("/login")
            }
            return
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (name) setKasirName(name)

        const fetchPelanggan = async () => {
            try {
                const currentToken = getAuthToken();

                // 👇 PERBAIKAN: Gunakan API_URL dari env, bukan localhost hardcoded
                const res = await fetch(`${API_URL}/users/pelanggan`, {
                    headers: { "Authorization": `Bearer ${currentToken}` }
                })

                const data = await res.json()
                if (data.status) setPelanggan(data.data)
            } catch (error) {
                console.error("Gagal ambil data pelanggan", error)
                toast.error("Gagal memuat data pelanggan")
            }
        }
        fetchPelanggan()
    }, [router, API_URL])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (form.meter_akhir < form.meter_awal) {
            toast.error("Meter akhir tidak boleh lebih kecil dari awal!")
            return
        }

        if (!form.userId) {
            toast.error("Pilih pelanggan terlebih dahulu!")
            return
        }

        const token = getAuthToken()
        const loadingToast = toast.loading("Menyimpan data...")

        try {
            // 👇 PERBAIKAN: Gunakan API_URL dari env
            const res = await fetch(`${API_URL}/tagihan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            })
            const data = await res.json()

            toast.dismiss(loadingToast)

            if (data.status) {
                toast.success("Tagihan Berhasil Dibuat!")
                // Reset form meteran saja, pelanggan tetap terpilih agar cepat input lagi
                setForm({ ...form, meter_awal: 0, meter_akhir: 0 })
            } else {
                toast.error("Gagal: " + data.message)
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error("Error koneksi server")
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        router.push('/')
    }

    // --- PERBAIKAN 2: HELPER UI (Handling NaN) ---
    // Menggunakan || 0 agar jika input kosong/NaN, kalkulasi dianggap 0, bukan error/blank
    const meterAkhirSafe = Number(form.meter_akhir) || 0
    const meterAwalSafe = Number(form.meter_awal) || 0
    const totalPemakaian = Math.max(0, meterAkhirSafe - meterAwalSafe)
    const estimasiBiaya = totalPemakaian * 5000

    return (
        <div className="min-h-screen bg-[#F3F6FD] font-sans text-slate-800 pb-20 relative overflow-x-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            {/* --- BACKGROUND DECORATION --- */}
            <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-b-[60px] shadow-2xl z-0"></div>
            <div className="absolute top-20 right-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl z-0"></div>
            <div className="absolute top-40 left-10 w-40 h-40 bg-blue-300 opacity-10 rounded-full blur-2xl z-0"></div>

            {/* 👇 3. COMPONENT SIDEBAR (Dipasang disini) */}
            <SidebarUser
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {/* Background Accent */}
            <div className="fixed top-0 left-0 right-0 h-64 bg-linear-to-br from-indigo-600 to-blue-500 rounded-b-[3rem] shadow-xl z-0 print:hidden"></div>

            {/* --- NAVBAR --- */}
            <nav className="relative z-30 container mx-auto px-6 py-6 flex justify-between items-center text-white print:text-black">
                <div className="flex items-center gap-4">

                    {/* 👇 4. TOMBOL HAMBURGER (Untuk Buka Sidebar) */}
                    {/* Ini akan muncul di Laptop DAN Mobile sesuai request Anda */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-xl border border-white/20 transition active:scale-95"
                    >
                        {/* Icon Hamburger (Garis Tiga) */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>


                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end text-white">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Selamat Bertugas</span>
                            <span className="font-semibold text-sm">{kasirName || "Admin Petugas"}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 container mx-auto px-4 md:px-8 mt-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT SIDEBAR (Navigation) --- */}
                    <div className="lg:col-span-4 space-y-5">

                        {/* Active Menu Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Input Tagihan</h2>
                                <p className="text-slate-500 text-sm mt-1 mb-4 leading-relaxed">Masukkan data meteran air pelanggan untuk bulan ini.</p>

                                <div className="flex items-center gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Menu Aktif</span>
                                </div>
                            </div>
                        </div>

                        {/* BUTTON VIEW DATA PELANGGAN (FITUR BARU) */}
                        <button
                            onClick={() => setShowModalPelanggan(true)}
                            className="w-full bg-white/80 hover:bg-white backdrop-blur-sm rounded-3xl p-5 shadow-sm hover:shadow-xl border border-transparent hover:border-blue-100 transition-all duration-300 group text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Data Pelanggan</h3>
                                    <p className="text-xs text-slate-400">Lihat semua data user</p>
                                </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        {/* Verifikasi Button */}
                        <button
                            onClick={() => router.push('/kasir/verifikasi')}
                            className="w-full bg-white/80 hover:bg-white backdrop-blur-sm rounded-3xl p-5 shadow-sm hover:shadow-xl border border-transparent hover:border-blue-100 transition-all duration-300 group text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Verifikasi</h3>
                                    <p className="text-xs text-slate-400">Cek pembayaran masuk</p>
                                </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        {/* Info Widget */}
                        <div className="bg-blue-800 text-blue-100 rounded-3xl p-6 relative overflow-hidden">
                            <svg className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-700 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Tips Petugas</p>
                            <p className="text-sm font-medium leading-relaxed z-10 relative">Pastikan foto meteran jelas sebelum input angka meteran akhir.</p>
                        </div>
                    </div>

                    {/* --- RIGHT CONTENT (Form) --- */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">

                            {/* Form Header */}
                            <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Formulir Pencatatan</h3>
                                    <p className="text-sm text-slate-500 mt-1">Isi data penggunaan air pelanggan.</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-bold text-slate-600">Sistem Online</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                                {/* SECTION 1: DATA PELANGGAN */}
                                <div className="space-y-5">
                                    <div className="relative group">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pilih Pelanggan</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <select
                                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none hover:bg-slate-100 cursor-pointer"
                                                value={form.userId}
                                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Cari Nama Pelanggan --</option>
                                                {pelanggan.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Bulan</label>
                                            <div className="relative">
                                                <select
                                                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-semibold text-slate-700 appearance-none"
                                                    value={form.bulan}
                                                    onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                                >
                                                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map(b => (
                                                        <option key={b} value={b}>{b}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">▼</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tahun</label>
                                            <input
                                                type="number"
                                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-semibold text-slate-700"
                                                value={form.tahun}
                                                onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100"></div>

                                {/* SECTION 2: INPUT METERAN (Digital Look) */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">💧</span>
                                            Input Data Meteran
                                        </h4>
                                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">Satuan: M³</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                        {/* Meteran Lalu */}
                                        <div className="group">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block group-hover:text-slate-600 transition">Meteran Lalu</label>
                                            <div className="relative overflow-hidden rounded-xl">
                                                <input
                                                    type="number"
                                                    className="w-full py-4 px-5 bg-slate-50 border-2 border-slate-100 rounded-xl text-3xl font-mono font-bold text-slate-400 focus:text-slate-600 focus:bg-white focus:border-slate-300 focus:ring-0 outline-none transition-all placeholder-slate-200"
                                                    value={form.meter_awal}
                                                    // PERBAIKAN: Gunakan || 0 untuk mencegah NaN
                                                    onChange={(e) => setForm({ ...form, meter_awal: Number(e.target.value) || 0 })}
                                                    placeholder="000"
                                                />
                                                <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-slate-50 to-transparent pointer-events-none"></div>
                                            </div>
                                        </div>

                                        {/* Meteran Saat Ini (Highlight) */}
                                        <div className="group relative">
                                            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
                                            <div className="relative bg-white rounded-xl">
                                                <label className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2 block absolute -top-8 left-1">Meteran Saat Ini</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full py-4 px-5 bg-white border-2 border-blue-500 rounded-xl text-3xl font-mono font-black text-slate-800 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                                                        value={form.meter_akhir}
                                                        // PERBAIKAN: Gunakan || 0 untuk mencegah NaN
                                                        onChange={(e) => setForm({ ...form, meter_akhir: Number(e.target.value) || 0 })}
                                                        placeholder="000"
                                                        required
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">m³</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: RINGKASAN BIAYA (Receipt Style) */}
                                <div className="bg-slate-900 rounded-2xl p-1 shadow-inner">
                                    <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">

                                        {/* Background Effects */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                                            <div className="text-center sm:text-left">
                                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Total Pemakaian Air</p>
                                                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                                                    <span className="text-4xl font-black text-white">{totalPemakaian}</span>
                                                    <span className="text-lg font-medium text-slate-500">m³</span>
                                                </div>
                                            </div>

                                            <div className="hidden sm:block w-px h-12 bg-slate-700"></div>

                                            <div className="text-center sm:text-right">
                                                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Estimasi Tagihan</p>
                                                <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                                                    <span className="text-lg font-normal text-emerald-600 mr-1">Rp</span>
                                                    {/* PERBAIKAN: Menangani NaN jika estimasiBiaya error */}
                                                    {(estimasiBiaya || 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-dashed border-slate-700 flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                                            <span>Tarif: Rp 5.000 / m³</span>
                                            <span>{form.bulan} {form.tahun}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BUTTON */}
                                <button
                                    type="submit"
                                    className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] flex justify-center items-center gap-3"
                                >
                                    <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    Simpan & Buat Tagihan
                                </button>

                            </form>
                        </div>
                    </div>

                </div>
            </main>

            {/* --- MODAL / POPUP DATA PELANGGAN (FITUR BARU) --- */}
            {showModalPelanggan && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowModalPelanggan(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Data Seluruh Pelanggan</h3>
                                <p className="text-sm text-slate-500">Daftar pelanggan terdaftar di sistem.</p>
                            </div>
                            <button
                                onClick={() => setShowModalPelanggan(false)}
                                className="p-2 bg-white rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shadow-sm border border-slate-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            {pelanggan.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">Belum ada data pelanggan.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                        <tr>
                                            <th className="px-6 py-3">ID</th>
                                            <th className="px-6 py-3">NAMA LENGKAP</th>
                                            <th className="px-6 py-3">EMAIL</th>
                                            <th className="px-6 py-3">ALAMAT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pelanggan.map((customer, index) => (
                                            <tr key={customer.id} className="border-b bg-white hover:bg-gray-50">
                                                {/* Kolom ID */}
                                                <td className="px-6 py-4">
                                                    #{customer.id || index + 1}
                                                </td>

                                                {/* Kolom Nama */}
                                                <td className="px-6 py-4 font-bold text-slate-700">
                                                    {customer.name}
                                                </td>

                                                {/* Kolom Email */}
                                                <td className="px-6 py-4 text-blue-600">
                                                    {customer.email}
                                                </td>

                                                {/* Kolom Alamat (jika ada) */}
                                                <td className="px-6 py-4 text-slate-500">
                                                    {customer.alamat || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}