/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

// 👇 Helper Cookies
import { getAuthToken, getUserRole, getUserId, getUserName, removeAuthToken } from "@/utils/cookies"

// ==========================================
// 👇 KONFIGURASI API (MENGGUNAKAN ENV)
// ==========================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- INTERFACES ---
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

// --- COMPONENT UTAMA ---
export default function UserDashboard() {
    // 1. STATE & LOGIC
    const [tagihan, setTagihan] = useState<ITagihan[]>([])
    const [profile, setProfile] = useState<IUser | null>(null)
    const [name, setName] = useState("")
    const [userId, setUserId] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadingId, setUploadingId] = useState<number | null>(null)
    const [greeting, setGreeting] = useState("")

    const router = useRouter()

    const ambilData = useCallback(async () => {
        const id = getUserId()
        const token = getAuthToken()
        if (!id || !token) return

        try {
            // 👇 UPDATE: Gunakan API_BASE_URL
            const resT = await fetch(`${API_BASE_URL}/tagihan/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const dataT = await resT.json()
            if (dataT.status) setTagihan(dataT.data)

            // 👇 UPDATE: Gunakan API_BASE_URL
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (hour < 12) setGreeting("Selamat Pagi")
        else if (hour < 18) setGreeting("Selamat Siang")
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

    const handleUpload = async (id: number) => {
        if (!selectedFile) return toast.error("Pilih foto bukti transfer dulu!")

        const formData = new FormData()
        formData.append("image", selectedFile)
        const token = getAuthToken()

        const loadingToast = toast.loading("Mengirim bukti...")

        try {
            // 👇 UPDATE: Gunakan API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/tagihan/upload/${id}`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()
            toast.dismiss(loadingToast)

            if (data.status) {
                toast.success("Berhasil! Menunggu verifikasi admin.")
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

    // Hitung Statistik Sederhana
    const totalTagihan = tagihan.length
    const belumLunas = tagihan.filter(t => t.status_bayar === "BELUM_BAYAR").length
    const menunggu = tagihan.filter(t => t.status_bayar === "MENUNGGU_VERIFIKASI").length

    // --- RENDER UI (PREMIUM LOOK) ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">

            {/* Background Accent */}
            <div className="fixed top-0 left-0 right-0 h-64 bg-linear-to-br from-indigo-600 to-blue-500 rounded-b-[3rem] shadow-xl z-0 print:hidden"></div>

            {/* --- NAVBAR --- */}
            <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center text-white print:text-black">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight leading-none">PDAM Pintar</h1>
                        <p className="text-xs opacity-80 font-medium">Customer Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* 👇 TOMBOL PENGADUAN DI NAVBAR */}
                    <button onClick={() => router.push('/user/pengaduan')} className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition border border-white/10">
                        <span>📢</span> Pengaduan
                    </button>

                    <button onClick={() => window.print()} className="hidden md:flex bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition border border-white/10">
                        🖨️ Cetak
                    </button>
                    <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 transition">
                        Logout
                    </button>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="relative z-10 container mx-auto px-6 mt-4">

                {/* 1. SECTION PROFILE & WELCOME */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 mb-8 border border-white/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:shadow-none print:border">
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1 flex items-center gap-2">
                            <span>👋</span> {greeting},
                        </p>
                        <h2 className="text-3xl font-black text-slate-800 capitalize mb-2">{name}</h2>
                        <div className="items-start gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-2 rounded-lg inline-block border border-slate-100">
                            <span className="mt-0.5">📍</span> {profile?.address || "Memuat alamat..."}
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">ID PELANGGAN</p>
                        <p className="text-3xl font-mono font-bold text-slate-700 tracking-wider">#{userId.padStart(4, '0')}</p>
                    </div>
                </div>

                {/* 2. STATS SUMMARY & ACTION (Updated Grid to 4 Cols) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 print:hidden">
                    {/* Stat 1 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">📃</div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Total Tagihan</p>
                            <p className="text-2xl font-black text-slate-800">{totalTagihan}</p>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl">⚠️</div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Belum Lunas</p>
                            <p className="text-2xl font-black text-slate-800">{belumLunas}</p>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">⏳</div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">Menunggu Verif</p>
                            <p className="text-2xl font-black text-slate-800">{menunggu}</p>
                        </div>
                    </div>

                    {/* 👇 4. KARTU BARU: TOMBOL PENGADUAN (Action Card) */}
                    <div
                        onClick={() => router.push('/user/pengaduan')}
                        className="cursor-pointer bg-linear-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg shadow-orange-200 border border-orange-400/20 flex items-center gap-4 text-white hover:scale-[1.02] transition-transform duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-2xl group-hover:rotate-12 transition">
                            📢
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase">Layanan</p>
                            <p className="text-lg font-black">Buat Pengaduan</p>
                        </div>
                    </div>
                </div>

                {/* 3. LIST TAGIHAN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Riwayat Pembayaran</h3>
                        <span className="text-xs font-medium text-slate-400">Terupdate otomatis</span>
                    </div>

                    {tagihan.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                            <div className="text-5xl mb-4 opacity-50">📭</div>
                            <h4 className="font-bold text-lg text-slate-600">Tidak ada tagihan</h4>
                            <p className="text-slate-400 text-sm">Semua pembayaran Anda sudah bersih.</p>
                        </div>
                    ) : (
                        tagihan.map((t, i) => (
                            <div key={i} className="group bg-white rounded-2xl p-0 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden print:break-inside-avoid print:shadow-none print:border-black">

                                <div className="flex flex-col md:flex-row">
                                    {/* Bagian Kiri: Informasi Utama */}
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                                    {t.bulan} {t.tahun}
                                                </div>
                                                {/* Status Badges */}
                                                {t.status_bayar === "LUNAS" && <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">LUNAS</span>}
                                                {t.status_bayar === "MENUNGGU_VERIFIKASI" && <span className="text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded border border-yellow-100">DIPROSES</span>}
                                                {t.status_bayar === "BELUM_BAYAR" && <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100">TERTUNGGAK</span>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Tagihan</p>
                                                <h4 className="text-3xl font-black text-slate-800 tracking-tight">Rp {t.total_bayar.toLocaleString('id-ID')}</h4>
                                            </div>
                                            <div className="mt-4 md:mt-0">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pemakaian Air</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded">{t.meter_awal}</span>
                                                    <span className="text-slate-300">➜</span>
                                                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{t.meter_akhir}</span>
                                                    <span className="text-sm font-bold text-slate-400 ml-1">({t.meter_akhir - t.meter_awal} m³)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bagian Kanan: Aksi */}
                                    <div className={`p-6 md:w-72 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 print:hidden
                                    ${t.status_bayar === 'LUNAS' ? 'bg-green-50/50' :
                                            t.status_bayar === 'MENUNGGU_VERIFIKASI' ? 'bg-yellow-50/50' : 'bg-slate-50'}
                                    `}>

                                        {/* 1. LUNAS */}
                                        {t.status_bayar === "LUNAS" ? (
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">🎉</div>
                                                <p className="font-bold text-green-800">Pembayaran Selesai</p>
                                                <p className="text-xs text-green-600/80 mt-1">Terima kasih telah membayar tepat waktu.</p>
                                            </div>

                                            /* 2. MENUNGGU VERIF */
                                        ) : t.status_bayar === "MENUNGGU_VERIFIKASI" ? (
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl animate-pulse">⏳</div>
                                                <p className="font-bold text-yellow-800">Sedang Diverifikasi</p>
                                                <p className="text-xs text-yellow-600/80 mt-1">Admin kami sedang mengecek bukti Anda.</p>
                                            </div>

                                            /* 3. BELUM BAYAR (FORM UPLOAD) */
                                        ) : (
                                            <>
                                                {uploadingId === t.id ? (
                                                    // State Uploading (Form)
                                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                                        <p className="text-xs font-bold text-slate-600 mb-2">Upload Bukti Transfer:</p>
                                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition mb-3">
                                                            {selectedFile ? (
                                                                <span className="text-xs font-bold text-indigo-600 truncate px-2">{selectedFile.name}</span>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                                    <svg className="w-6 h-6 text-indigo-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                                    <p className="text-[10px] text-indigo-500 font-bold">Klik untuk pilih foto</p>
                                                                </div>
                                                            )}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                                                        </label>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button onClick={() => { setUploadingId(null); setSelectedFile(null); }} className="py-2 rounded-lg text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100">
                                                                Batal
                                                            </button>
                                                            <button onClick={() => handleUpload(t.id)} className="py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                                                                Kirim
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Tombol Awal (Bayar)
                                                    <button onClick={() => setUploadingId(t.id)} className="w-full h-full min-h-25 flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition group/btn shadow-lg shadow-indigo-200">
                                                        <span className="text-2xl group-hover/btn:scale-110 transition duration-300">💳</span>
                                                        <span className="font-bold text-sm">Bayar Sekarang</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Print Only Status */}
                                    <div className="hidden print:block absolute top-4 right-4 border-2 border-black p-2 font-bold text-sm">
                                        STATUS: {t.status_bayar}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center mt-12 mb-8 text-slate-400 text-sm print:hidden">
                    <p>&copy; {new Date().getFullYear()} PDAM Pintar System. Butuh bantuan? <button onClick={() => router.push('/user/pengaduan')} className="text-indigo-500 font-bold hover:underline">Hubungi CS</button></p>
                </div>

            </main>
        </div>
    )
}