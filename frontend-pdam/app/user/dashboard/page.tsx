/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import { getAuthToken, getUserRole, getUserId, getUserName, removeAuthToken } from "@/utils/cookies"
import SidebarUser from "@/components/User/SidebarUser"
import {
    Menu,
    Printer,
    MapPin,
    FileText,
    AlertCircle,
    Clock,
    Headphones,
    CheckCircle2,
    UploadCloud,
    CreditCard,
    X,
    Receipt,
    ArrowRight
} from "lucide-react"

// --- KONFIGURASI API ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ITagihan {
    id: number;
    bulan: string;
    tahun: number;
    meter_awal: number;
    meter_akhir: number;
    total_bayar: number;
    status_bayar: string;
    bukti_bayar: string | null;
}

interface IUser {
    name: string;
    email: string;
    address: string;
}

export default function UserDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [tagihan, setTagihan] = useState<ITagihan[]>([])
    const [profile, setProfile] = useState<IUser | null>(null)
    const [name, setName] = useState("")
    const [userId, setUserId] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadingId, setUploadingId] = useState<number | null>(null)
    const [greeting, setGreeting] = useState("")

    const router = useRouter()

    // --- LOGIC FETCH DATA ---
    const ambilData = useCallback(async () => {
        const id = getUserId()
        const token = getAuthToken()
        if (!id || !token) return
        try {
            const resT = await fetch(`${API_BASE_URL}/tagihan/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const dataT = await resT.json()
            if (dataT.status) setTagihan(dataT.data)

            const resP = await fetch(`${API_BASE_URL}/user/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const dataP = await resP.json()
            if (dataP.status) setProfile(dataP.data)
        } catch (error) {
            console.error("Error fetching data", error)
        }
    }, [])

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Selamat Pagi")
        else if (hour < 15) setGreeting("Selamat Siang")
        else if (hour < 18) setGreeting("Selamat Sore")
        else setGreeting("Selamat Malam")

        const token = getAuthToken()
        const role = getUserRole()
        const id = getUserId()
        const userName = getUserName()

        if (!token || !id) {
            router.push("/login")
            return
        }
        if (role === "MANAGER") {
            router.push("/manager/dashboard")
            return
        }
        if (role === "KASIR") {
            toast.error("Halaman khusus Pelanggan.")
            router.push("/kasir/dashboard")
            return
        }

        setName(userName || "Pelanggan")
        setUserId(id)
        ambilData()
    }, [router, ambilData])

    // --- LOGIC UPLOAD ---
    const handleUpload = async (id: number) => {
        if (!selectedFile) return toast.error("Pilih foto bukti transfer dulu!")
        const formData = new FormData()
        formData.append("image", selectedFile)
        const token = getAuthToken()
        const loadingToast = toast.loading("Mengirim bukti...")

        try {
            const res = await fetch(`${API_BASE_URL}/tagihan/upload/${id}`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()
            toast.dismiss(loadingToast)
            if (data.status) {
                toast.success("Berhasil! Menunggu verifikasi kasir.")
                setUploadingId(null)
                setSelectedFile(null)
                ambilData()
            } else {
                toast.error("Gagal: " + data.message)
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error("Kesalahan koneksi.")
        }
    }

    const handleLogout = () => {
        removeAuthToken()
        toast.success("Berhasil keluar")
        router.push("/")
    }

    const totalTagihan = tagihan.length
    const belumLunas = tagihan.filter(t => t.status_bayar === "BELUM_BAYAR").length
    const menunggu = tagihan.filter(t => t.status_bayar === "MENUNGGU_VERIFIKASI").length

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex overflow-x-hidden font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-700">
            <Toaster position="top-center" />

            {/* SIDEBAR COMPONENT */}
            <SidebarUser
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72 pb-24">

                {/* HEADER / NAVBAR */}
                <header className="bg-white/60 backdrop-blur-xl border-b border-slate-100 px-6 lg:px-10 py-5 flex justify-between items-center sticky top-0 z-20 print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="font-extrabold text-xl text-slate-800 tracking-tight leading-none">Dashboard</h1>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Portal Pelanggan</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => window.print()} className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 transition-all shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                            <Printer size={16} /> Cetak
                        </button>
                        <div className="w-11 h-11 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-200 ring-4 ring-white">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10">

                    {/* 1. HERO BANNER */}
                    <div className="bg-[#0A0F2C] rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 print:shadow-none print:border print:bg-none print:text-black">
                        {/* Efek Cahaya Abstract (Glowing Orbs) */}
                        <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-br from-blue-600/40 to-indigo-600/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-75 h-75 bg-blue-400/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                        <div className="relative z-10 text-white w-full md:w-auto">
                            <p className="text-blue-200/80 font-medium text-sm mb-3">
                                {greeting},
                            </p>
                            <h2 className="text-4xl md:text-5xl font-black capitalize mb-6 tracking-tight leading-tight">{name}</h2>

                            <div className="inline-flex items-center gap-3 text-sm bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <MapPin size={16} className="text-blue-400 shrink-0" />
                                </div>
                                <span className="font-medium text-blue-50 line-clamp-1">{profile?.address || "Memuat alamat..."}</span>
                            </div>
                        </div>

                        {/* ID Card Wrapper */}
                        <div className="relative z-10 w-full md:w-auto bg-linear-to-b from-white/10 to-white/5 backdrop-blur-2xl p-6 rounded-4xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
                            <div className="flex flex-col items-start md:items-end">
                                <p className="text-[11px] font-black text-blue-300/80 uppercase tracking-[0.2em] mb-2">ID Pelanggan</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-400 font-black text-2xl">#</span>
                                    <p className="text-4xl font-mono font-black text-white tracking-widest">{userId.padStart(5, '0')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. STATS SUMMARY - MENGGUNAKAN GRID YANG LEBIH PROPORIONAL */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 print:hidden">
                        {/* Card 1 */}
                        <div className="bg-white p-6 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FileText size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">Semua Tagihan</p>
                                <p className="text-3xl font-black text-slate-800">{totalTagihan}</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-6 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                    <AlertCircle size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">Belum Lunas</p>
                                <p className="text-3xl font-black text-slate-800">{belumLunas}</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-6 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <Clock size={24} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">Verifikasi</p>
                                <p className="text-3xl font-black text-slate-800">{menunggu}</p>
                            </div>
                        </div>

                        {/* Action Card: Pengaduan */}
                        <div
                            onClick={() => router.push('/user/pengaduan')}
                            className="cursor-pointer bg-slate-900 p-6 rounded-4xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-slate-800 flex flex-col justify-between h-36 text-white hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Dekorasi Card Action */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-700/50 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                    <Headphones size={24} strokeWidth={2.5} />
                                </div>
                                <ArrowRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Bantuan</p>
                                <p className="text-xl font-black leading-tight">Buat Laporan</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. LIST TAGIHAN */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Receipt size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">Riwayat Pembayaran</h3>
                        </div>

                        {tagihan.length === 0 ? (
                            <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <CheckCircle2 size={48} strokeWidth={1.5} />
                                </div>
                                <h4 className="font-black text-2xl text-slate-800 mb-2">Semua Lunas!</h4>
                                <p className="text-slate-500">Tidak ada tagihan yang perlu dibayar saat ini.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {tagihan.map((t, i) => (
                                    <div key={i} className="group bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden print:break-inside-avoid flex flex-col lg:flex-row">

                                        {/* DETAIL KIRI (INFO TAGIHAN) */}
                                        <div className="p-8 lg:p-10 flex-1 flex flex-col justify-center">
                                            {/* Header Info: Bulan & Status */}
                                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                                <div className="bg-slate-50 text-slate-600 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest border border-slate-100">
                                                    {t.bulan} {t.tahun}
                                                </div>
                                                {t.status_bayar === "LUNAS" && <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100"><CheckCircle2 size={16} /> LUNAS</span>}
                                                {t.status_bayar === "MENUNGGU_VERIFIKASI" && <span className="flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-100"><Clock size={16} /> DIPROSES</span>}
                                                {t.status_bayar === "BELUM_BAYAR" && <span className="flex items-center gap-1.5 text-rose-700 text-xs font-bold bg-rose-50 px-4 py-2 rounded-xl border border-rose-100"><AlertCircle size={16} /> TERTUNGGAK</span>}
                                            </div>

                                            {/* Nominal & Meteran */}
                                            <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16">
                                                <div>
                                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-2">Total Tagihan</p>
                                                    <h4 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">Rp {t.total_bayar.toLocaleString('id-ID')}</h4>
                                                </div>

                                                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 inline-block">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Pemakaian Air</p>
                                                    <div className="flex items-center gap-3 text-base font-bold">
                                                        <span className="text-slate-500">{t.meter_awal}</span>
                                                        <ArrowRight size={16} className="text-slate-300" />
                                                        <span className="text-blue-600">{t.meter_akhir}</span>
                                                        <span className="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-lg text-sm ml-2">
                                                            {t.meter_akhir - t.meter_awal} m³
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* KOLOM KANAN (AKSI / STATUS BESAR) */}
                                        <div className="p-8 lg:w-96 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-center print:hidden">
                                            {t.status_bayar === "LUNAS" ? (
                                                <div className="text-center py-4">
                                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CheckCircle2 size={40} strokeWidth={2.5} />
                                                    </div>
                                                    <p className="text-lg font-black text-emerald-700 mb-1">Pembayaran Selesai</p>
                                                    <p className="text-sm font-medium text-emerald-600/70">Terima kasih atas pembayaran Anda.</p>
                                                </div>
                                            ) : t.status_bayar === "MENUNGGU_VERIFIKASI" ? (
                                                <div className="text-center py-4">
                                                    <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                        <Clock size={40} strokeWidth={2.5} />
                                                    </div>
                                                    <p className="text-lg font-black text-amber-700 mb-1">Sedang Diverifikasi</p>
                                                    <p className="text-sm font-medium text-amber-600/70">Admin sedang mengecek dana Anda.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {uploadingId === t.id ? (
                                                        <div className="animate-in fade-in duration-300 w-full">
                                                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Upload Bukti Transfer</p>

                                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-200 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-400 transition-all mb-4 relative overflow-hidden group">
                                                                {selectedFile ? (
                                                                    <div className="text-center p-4">
                                                                        <CheckCircle2 className="text-blue-500 mx-auto mb-2" size={32} />
                                                                        <span className="text-sm font-bold text-slate-700 block truncate max-w-50">{selectedFile.name}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center p-4">
                                                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                                            <UploadCloud size={24} />
                                                                        </div>
                                                                        <p className="text-xs font-bold text-slate-500">Pilih dari galeri</p>
                                                                    </div>
                                                                )}
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                                                            </label>

                                                            <div className="flex gap-3">
                                                                <button onClick={() => { setUploadingId(null); setSelectedFile(null); }} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex justify-center items-center">
                                                                    Batal
                                                                </button>
                                                                <button onClick={() => handleUpload(t.id)} className="flex-1 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex justify-center items-center gap-2">
                                                                    Kirim <ArrowRight size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setUploadingId(t.id)} className="w-full py-8 flex flex-col items-center justify-center gap-4 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl transition-all shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] active:scale-95 group/btn">
                                                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:bg-blue-500/20 transition-all duration-300">
                                                                <CreditCard size={32} className="group-hover/btn:text-blue-400 transition-colors" />
                                                            </div>
                                                            <span className="font-black text-sm uppercase tracking-widest text-slate-300 group-hover/btn:text-white transition-colors">Bayar Sekarang</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="text-center mt-16 pt-8 text-slate-400 text-sm font-medium print:hidden">
                        <p>&copy; {new Date().getFullYear()} PDAM Pintar. Butuh bantuan? <button onClick={() => router.push('/user/pengaduan')} className="text-blue-600 font-bold hover:underline">Hubungi CS</button></p>
                    </div>
                </div>
            </main>
        </div>
    )
}