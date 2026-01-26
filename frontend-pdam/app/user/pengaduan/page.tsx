/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { getAuthToken, getUserRole, getUserId, getUserName, removeAuthToken } from "@/utils/cookies"

// --- INTERFACES ---
interface IPengaduan {
    id: number;
    judul: string;
    deskripsi: string;
    foto: string | null;
    status: string;
    tanggapan: string | null;
    createdAt: string;
}

export default function UserPengaduan() {
    // 0. SETUP ENV URL
    // Mengambil URL dari file .env (Next.js otomatis membaca NEXT_PUBLIC_*)
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    // 1. STATE
    const [riwayat, setRiwayat] = useState<IPengaduan[]>([])

    // Form State
    const [judul, setJudul] = useState("")
    const [deskripsi, setDeskripsi] = useState("")
    const [foto, setFoto] = useState<File | null>(null)

    const [loading, setLoading] = useState(false)
    const [userName, setUserName] = useState("")

    const router = useRouter()

    // 2. FETCH DATA RIWAYAT
    const ambilData = useCallback(async () => {
        const id = getUserId()
        const token = getAuthToken()
        if (!id || !token) return

        try {
            // UPDATED: Menggunakan API_URL
            const res = await fetch(`${API_URL}/pengaduan/user/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.status) {
                setRiwayat(data.data)
            }
        } catch (error) {
            console.error("Gagal ambil history pengaduan", error)
            toast.error("Gagal terhubung ke server")
        }
    }, [API_URL]) // Dependency ditambahkan

    // 3. CEK AUTH
    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()

        if (!token) {
            router.push("/login")
            return
        }

        if (role === "MANAGER") router.push("/manager/dashboard")
        if (role === "KASIR") router.push("/kasir/dashboard")

        setUserName(getUserName() || "Pelanggan")
        ambilData()
    }, [router, ambilData])

    // 4. HANDLE SUBMIT (Kirim Laporan)
    const handleKirim = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!judul || !deskripsi) return toast.error("Judul dan Deskripsi wajib diisi")

        const token = getAuthToken()
        const id = getUserId()
        setLoading(true)

        const formData = new FormData()
        formData.append("user_id", id || "")
        formData.append("judul", judul)
        formData.append("deskripsi", deskripsi)
        if (foto) {
            formData.append("image", foto)
        }

        try {
            // UPDATED: Menggunakan API_URL
            const res = await fetch(`${API_URL}/pengaduan`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            })
            const data = await res.json()

            if (data.status) {
                toast.success("Laporan berhasil dikirim!")
                setJudul("")
                setDeskripsi("")
                setFoto(null)
                ambilData() // Refresh list
            } else {
                toast.error(data.message || "Gagal mengirim")
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem")
        } finally {
            setLoading(false)
        }
    }

    // ---------------------------------------------------------
    // 5. HANDLE HAPUS
    // ---------------------------------------------------------

    // Fungsi A: Menjalankan penghapusan
    const executeHapus = async (id: number) => {
        const token = getAuthToken()
        const loadingToast = toast.loading("Sedang menghapus...");

        try {
            // UPDATED: Menggunakan API_URL
            const res = await fetch(`${API_URL}/pengaduan/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.status) {
                toast.success("Laporan berhasil dihapus", { id: loadingToast })
                ambilData() 
            } else {
                toast.error(data.message || "Gagal menghapus", { id: loadingToast })
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem", { id: loadingToast })
        }
    }

    // Fungsi B: Memunculkan UI Konfirmasi
    const handleHapus = (id: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3 items-center min-w-62.5 p-2">
                <div className="text-center">
                    <p className="font-bold text-slate-800">Hapus Laporan?</p>
                    <p className="text-xs text-slate-500 mt-1">Data yang dihapus tidak bisa dikembalikan.</p>
                </div>

                <div className="flex gap-2 w-full mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 bg-slate-100 text-slate-600 text-xs py-2.5 px-3 rounded-lg hover:bg-slate-200 transition font-bold"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id)
                            executeHapus(id)
                        }}
                        className="flex-1 bg-red-500 text-white text-xs py-2.5 px-3 rounded-lg hover:bg-red-600 transition font-bold shadow-red-200 shadow-md"
                    >
                        Ya, Hapus
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                background: '#fff',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                border: '1px solid #f1f5f9'
            }
        })
    }

    const handleLogout = () => {
        removeAuthToken()
        toast.success("Berhasil keluar")
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">

            {/* Background Header */}
            <div className="fixed top-0 left-0 right-0 h-64 bg-linear-to-br from-indigo-600 to-blue-500 rounded-b-[3rem] shadow-xl z-0"></div>

            {/* --- NAVBAR --- */}
            <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <Link href="/user/dashboard" className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-xl border border-white/20 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight leading-none">Layanan Pengaduan</h1>
                        <p className="text-xs opacity-80 font-medium">PDAM Support Center</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 transition">
                    Logout
                </button>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <main className="relative z-10 container mx-auto px-6 mt-4">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* KOLOM KIRI: FORM INPUT */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm sticky top-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-slate-800 mb-1">Buat Laporan</h2>
                                <p className="text-slate-500 text-sm">Sertakan foto bukti agar penanganan lebih cepat.</p>
                            </div>

                            <form onSubmit={handleKirim} className="space-y-4">
                                {/* Input Judul */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Masalah</label>
                                    <input
                                        type="text"
                                        value={judul}
                                        onChange={(e) => setJudul(e.target.value)}
                                        placeholder="Contoh: Pipa Bocor Depan Rumah"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>

                                {/* Input Deskripsi */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detail Kronologi</label>
                                    <textarea
                                        value={deskripsi}
                                        onChange={(e) => setDeskripsi(e.target.value)}
                                        placeholder="Jelaskan lokasi dan masalahnya..."
                                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                                    ></textarea>
                                </div>

                                {/* Input Foto */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Foto Bukti (Opsional)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition group">
                                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                            {foto ? (
                                                <div className="text-center px-2">
                                                    <p className="text-xs text-indigo-600 font-bold truncate max-w-50">{foto.name}</p>
                                                    <p className="text-[10px] text-slate-400">Klik untuk ganti</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-xl mb-1 opacity-40 group-hover:scale-110 transition">📷</span>
                                                    <p className="text-[10px] text-slate-400">Upload Foto (Max 2MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? "Mengirim..." : "Kirim Laporan"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* KOLOM KANAN: LIST RIWAYAT */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800 lg:text-white lg:drop-shadow-md">Riwayat Laporan</h3>
                            <span className="bg-white/20 lg:bg-white/90 text-white lg:text-indigo-900 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm">
                                {riwayat.length} Total
                            </span>
                        </div>

                        {riwayat.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                                <div className="text-6xl mb-4 opacity-20 grayscale">📂</div>
                                <h4 className="font-bold text-lg text-slate-600">Belum ada laporan</h4>
                                <p className="text-slate-400 text-sm mt-1">Jika ada masalah, silakan lapor di formulir sebelah kiri.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {riwayat.map((item) => (
                                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col md:flex-row gap-6 group/card relative">

                                        {/* Bagian Text */}
                                        <div className="flex-1 order-2 md:order-1 flex flex-col h-full">

                                            {/* Header Kartu */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>

                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border 
                                                    ${item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                        item.status === 'SELESAI' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {item.status || "DIPROSES"}
                                                </span>

                                                {/* TOMBOL HAPUS (Kanan Atas) */}
                                                <button
                                                    onClick={() => handleHapus(item.id)}
                                                    className="ml-auto text-xs flex items-center gap-1 text-slate-300 hover:text-red-500 transition px-2 py-1 rounded-md hover:bg-red-50"
                                                    title="Hapus Laporan"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    <span className="hidden md:inline">Hapus</span>
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-lg text-slate-800 mb-2">{item.judul}</h4>

                                            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {item.deskripsi}
                                            </p>

                                            {/* Balasan Manager */}
                                            {item.tanggapan && (
                                                <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative animate-fadeIn">
                                                    <div className="absolute -top-3 left-4 bg-white border border-indigo-100 p-1 rounded-full shadow-sm">
                                                        <span className="text-lg">💬</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1 mt-1">
                                                        Balasan Petugas:
                                                    </p>
                                                    <p className="text-slate-700 text-sm leading-relaxed">
                                                        {item.tanggapan}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bagian Gambar */}
                                        {item.foto && (
                                            <div className="md:w-32 h-32 shrink-0 order-1 md:order-2">
                                                <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 relative group">
                                                    {/* UPDATED: Menggunakan API_URL untuk Source Gambar */}
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={`${API_URL}/uploads/${item.foto}`}
                                                        alt="Bukti"
                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                    />
                                                    {/* UPDATED: Menggunakan API_URL untuk Link Gambar */}
                                                    <a
                                                        href={`${API_URL}/uploads/${item.foto}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold"
                                                    >
                                                        Lihat Full
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}