"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"

interface ITagihanVerifikasi {
    id: number;
    userName: string; // Pastikan backend mengirim field ini (hasil join user)
    bulan: string;
    tahun: number;
    total_bayar: number;
    bukti_bayar: string;
    status: string;
}

export default function VerifikasiPage() {
    const [list, setList] = useState<ITagihanVerifikasi[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // --- 1. PROTEKSI HALAMAN ---
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")

        if (!token) {
            router.push("/login")
            return
        }

        if (role !== "KASIR") {
            router.push("/login")
            return
        }

        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadData = async () => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch('http://localhost:8000/tagihan/verifikasi/list', {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.status) {
                setList(data.data)
            }
        } catch (error) {
            console.error("Error fetching verification list", error)
        } finally {
            setLoading(false)
        }
    }

    const proses = async (id: number, aksi: string) => {
        const pesan = aksi === 'TERIMA'
            ? "Apakah Anda yakin BUKTI INI VALID dan ingin melunaskan tagihan?"
            : "Apakah Anda yakin ingin MENOLAK bukti pembayaran ini?";

        if (!confirm(pesan)) return;

        const token = localStorage.getItem("token")

        try {
            const res = await fetch(`http://localhost:8000/tagihan/verifikasi/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ aksi })
            })
            const data = await res.json()

            if (data.status) {
                toast.success(`Berhasil: ${aksi === 'TERIMA' ? 'Tagihan Lunas' : 'Bukti Ditolak'}`);
                // Hapus item dari list secara langsung (Optimistic UI) agar tidak perlu reload
                setList(prev => prev.filter(item => item.id !== id))
            } else {
                toast.error("Gagal memproses: " + data.message)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Terjadi kesalahan koneksi ke server.")
        }
    }

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-sky-800 flex items-center gap-2">
                        <span>🔍</span> VERIFIKASI PEMBAYARAN
                    </h1>
                    <p className="text-slate-500 mt-1">Cek keaslian bukti transfer pelanggan sebelum validasi.</p>
                </div>
                <button
                    onClick={() => router.push('/kasir/dashboard')}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
                >
                    &larr; Kembali ke Dashboard
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mb-4"></div>
                    <p className="text-slate-400">Memuat data pembayaran...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {list.length === 0 && (
                        <div className="bg-white p-16 text-center rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-6xl mb-4">📂</p>
                            <h3 className="text-xl font-bold text-slate-600">Semua Bersih!</h3>
                            <p className="text-slate-400">Tidak ada pembayaran yang menunggu verifikasi saat ini.</p>
                        </div>
                    )}

                    {list.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-lg transition duration-300">

                            {/* Kolom Kiri: Gambar Bukti */}
                            <div className="w-full md:w-1/3">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <span>📷</span> Bukti Transfer
                                </p>
                                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 group relative">
                                    {/* Link untuk membuka gambar full size */}
                                    <a href={`http://localhost:8000/uploads/${item.bukti_bayar}`} target="_blank" rel="noreferrer" className="block relative overflow-hidden rounded-lg">
                                        <Image
                                            src={`http://localhost:8000/uploads/${item.bukti_bayar}`}
                                            alt="Bukti Bayar"
                                            width={400}
                                            height={300}
                                            className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500 cursor-zoom-in"
                                            unoptimized={true} // Penting jika load dari localhost/backend langsung
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 font-bold bg-black/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                                Klik untuk memperbesar
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Kolom Kanan: Informasi & Aksi */}
                            <div className="w-full md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">Pelanggan</p>
                                            <h2 className="text-2xl font-black text-slate-800 uppercase leading-none">{item.userName}</h2>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold mb-1">
                                                Menunggu Konfirmasi
                                            </span>
                                            <p className="text-sm font-medium text-slate-500">
                                                Tagihan: {item.bulan} {item.tahun}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-sky-50 p-5 rounded-xl border border-sky-100 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-sky-800">Total Nominal Transfer:</span>
                                        <span className="text-3xl font-black text-sky-700">Rp {item.total_bayar.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={() => proses(item.id, 'TERIMA')}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition transform active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        TERIMA (LUNAS)
                                    </button>

                                    <button
                                        onClick={() => proses(item.id, 'TOLAK')}
                                        className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 py-3.5 rounded-xl font-bold transition transform active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        TOLAK BUKTI
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}