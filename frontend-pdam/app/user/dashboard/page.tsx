"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

// Definisi Struktur Data Tagihan
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
    const [tagihan, setTagihan] = useState<ITagihan[]>([])
    const [profile, setProfile] = useState<IUser | null>(null)
    const [name, setName] = useState("")

    // State untuk menyimpan ID agar aman dari error Server
    const [userId, setUserId] = useState<string>("")

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadingId, setUploadingId] = useState<number | null>(null)

    const router = useRouter()

    const ambilData = useCallback(async () => {
        const id = localStorage.getItem("userId")
        if (!id) return

        try {
            const resT = await fetch(`http://localhost:8000/tagihan/${id}`)
            const dataT = await resT.json()
            if (dataT.status) setTagihan(dataT.data)

            const resP = await fetch(`http://localhost:8000/user/${id}`)
            const dataP = await resP.json()
            if (dataP.status) setProfile(dataP.data)
        } catch (error) {
            console.error("Gagal mengambil data:", error)
        }
    }, [])

    useEffect(() => {
        // --- LOGIC PROTEKSI ROLE ---
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role") // Ambil Role
        const id = localStorage.getItem("userId")
        const userName = localStorage.getItem("name")

        // 1. Cek apakah Login?
        if (!token || !id) {
            router.push("/login")
            return
        }

        // 2. Cek Role (PENTING AGAR TIDAK TERTUKAR)
        if (role === "MANAGER") {
            // Jika Manager nyasar ke sini, tendang ke Dashboard Manager
            router.push("/manager/dashboard")
            return
        }
        if (role === "KASIR") {
            // Jika Kasir nyasar ke sini, tendang ke Dashboard Kasir (jika ada) atau Login
            // router.push("/kasir/dashboard") 
            toast.error("Anda login sebagai Kasir. Halaman ini khusus Pelanggan.")
            router.push("/login")
            return
        }

        // 3. Jika Lolos (Benar-benar Pelanggan), baru set state & ambil data
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(userName || "Pelanggan")
        setUserId(id)
        ambilData()

    }, [router, ambilData])

    const handleUpload = async (id: number) => {
        if (!selectedFile) return toast.error("Harap pilih foto bukti transfer terlebih dahulu!")

        const formData = new FormData()
        formData.append("image", selectedFile)

        try {
            const res = await fetch(`http://localhost:8000/tagihan/upload/${id}`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.status) {
                toast.success("Bukti pembayaran berhasil dikirim! Mohon tunggu verifikasi admin.")
                setUploadingId(null)
                setSelectedFile(null)
                ambilData()
            } else {
                toast.error("Gagal upload: " + data.message)
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Terjadi kesalahan koneksi.")
        }
    }

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen text-black font-sans">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 print:hidden gap-4">
                <div>
                    <h1 className="text-3xl font-black text-sky-700 italic tracking-tighter">💧 PDAM DIGITAL</h1>
                    <p className="text-gray-500 text-sm">Sistem Informasi Tagihan Air Mandiri</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => window.print()} className="bg-white border-2 border-sky-600 text-sky-600 hover:bg-sky-50 px-5 py-2 rounded-xl font-bold transition shadow-sm">
                        🖨️ Cetak
                    </button>
                    <button onClick={() => { localStorage.clear(); router.push("/login") }} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow-md transition">
                        Keluar
                    </button>
                </div>
            </div>

            {/* KARTU PROFIL */}
            <div className="mb-8 bg-linear-to-r from-sky-600 to-sky-800 p-8 rounded-[2.5rem] shadow-xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Nama Pelanggan</p>
                        <h2 className="text-3xl font-black uppercase mb-4">{name}</h2>
                        <div className="bg-sky-900/30 p-4 rounded-2xl border border-sky-400/20 backdrop-blur-sm">
                            <p className="text-xs opacity-70 mb-1 uppercase font-bold">Alamat Pemasangan:</p>
                            <p className="text-sm italic">&quot;{profile?.address || 'Alamat tidak ditemukan'}&quot;</p>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 text-right">
                        <p className="text-xs font-bold opacity-80 uppercase">ID Pelanggan</p>
                        <p className="text-2xl font-mono font-bold">#00{userId}</p>
                    </div>
                </div>
            </div>

            {/* DAFTAR TAGIHAN */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-bold text-slate-700 flex items-center">
                        <span className="mr-2 text-2xl">📊</span> Riwayat & Pembayaran
                    </h3>
                    <p className="text-sm text-slate-500 font-bold">
                        Belum Lunas: <span className="text-red-500">{tagihan.filter(t => t.status_bayar === "BELUM_BAYAR").length} Bulan</span>
                    </p>
                </div>

                {tagihan.map((t, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-sky-200 transition-all">

                        {/* Kolom Kiri: Info Tagihan */}
                        <div className="w-full md:w-1/2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sky-600 text-xs font-black uppercase tracking-widest bg-sky-100 px-2 py-1 rounded">{t.bulan} {t.tahun}</span>
                                {t.status_bayar === "MENUNGGU_VERIFIKASI" && <span className="text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-1 rounded">⏳ MENUNGGU VERIFIKASI</span>}
                            </div>
                            <h4 className="text-2xl font-black text-slate-800">Rp {t.total_bayar.toLocaleString('id-ID')}</h4>
                            <p className="text-gray-400 text-sm mt-1">Pemakaian: <span className="text-slate-700 font-bold">{t.meter_akhir - t.meter_awal} m³</span></p>
                        </div>

                        {/* Kolom Kanan: Aksi (Upload / Status) */}
                        <div className="w-full md:w-1/2 flex justify-end print:hidden">
                            {t.status_bayar === "LUNAS" ? (
                                <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-black text-sm border border-green-200">
                                    <span>LUNAS</span><span className="text-lg">✅</span>
                                </div>
                            ) : t.status_bayar === "MENUNGGU_VERIFIKASI" ? (
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-500">Bukti Terkirim</p>
                                    <p className="text-xs text-slate-400">Menunggu admin mengecek...</p>
                                </div>
                            ) : (
                                // LOGIKA UPLOAD
                                <div className="w-full md:w-auto">
                                    {uploadingId === t.id ? (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fade-in">
                                            <p className="text-xs font-bold mb-2 text-slate-600">Upload Bukti Transfer:</p>
                                            <input
                                                title="input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 mb-3"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpload(t.id)} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-bold hover:bg-blue-700">Kirim</button>
                                                <button onClick={() => { setUploadingId(null); setSelectedFile(null); }} className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg text-sm font-bold hover:bg-gray-400">Batal</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setUploadingId(t.id)}
                                            className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-red-200 transition-all active:scale-95"
                                        >
                                            BAYAR TAGIHAN
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Cetak */}
                        <div className="hidden print:block font-bold text-green-600">
                            {t.status_bayar === "LUNAS" ? "LUNAS" : "BELUM LUNAS"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}