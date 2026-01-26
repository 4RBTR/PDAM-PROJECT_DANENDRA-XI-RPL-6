"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { getAuthToken, getUserRole } from "@/utils/cookies"

interface ITagihanVerifikasi {
    id: number;
    userName: string;
    bulan: string;
    tahun: number;
    total_bayar: number;
    bukti_bayar: string;
    status: string;
}

export default function VerifikasiPage() {
    // 👇 Menggunakan ENV Variable agar konsisten dengan file lain
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const [list, setList] = useState<ITagihanVerifikasi[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // --- STATE UNTUK MODAL & PROSES ---
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ITagihanVerifikasi | null>(null)
    const [actionType, setActionType] = useState<'TERIMA' | 'TOLAK' | null>(null)
    const [catatan, setCatatan] = useState("") 

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()

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
        try {
            const token = getAuthToken()
            // 👇 Fetch menggunakan API_URL dari env
            const res = await fetch(`${API_URL}/tagihan/verifikasi/list`, {
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
            toast.error("Gagal memuat data list")
        } finally {
            setLoading(false)
        }
    }

    // --- LOGIKA MODAL ---
    const openConfirmModal = (item: ITagihanVerifikasi, type: 'TERIMA' | 'TOLAK') => {
        setSelectedItem(item)
        setActionType(type)
        setCatatan("") 
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedItem(null)
        setActionType(null)
        setProcessing(false)
    }

    // --- PROSES API ---
    const handleProcess = async () => {
        if (!selectedItem || !actionType) return;

        if (actionType === 'TOLAK' && catatan.trim().length < 5) {
             toast("Mohon isi alasan penolakan (minimal 5 karakter)", { icon: "✍️" });
             return;
        }

        setProcessing(true)
        const token = getAuthToken()

        try {
            // 👇 Request PUT ke endpoint API
            const res = await fetch(`${API_URL}/tagihan/verifikasi/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    aksi: actionType,
                    catatan: catatan 
                })
            })
            const data = await res.json()

            if (data.status) {
                toast.success(`Berhasil: ${actionType === 'TERIMA' ? 'Tagihan Lunas' : 'Bukti Ditolak'}`);
                setList(prev => prev.filter(item => item.id !== selectedItem.id))
                closeModal()
            } else {
                toast.error("Gagal: " + data.message)
            }
        } catch (error) {
            toast.error("Terjadi kesalahan koneksi.")
            console.error(error)
        } finally {
            setProcessing(false)
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
                    <p className="text-slate-500 mt-1">Validasi bukti transfer pelanggan.</p>
                </div>
                <button
                    onClick={() => router.push('/kasir/dashboard')}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
                >
                    &larr; Kembali ke Dashboard
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mb-4"></div>
                    <p className="text-slate-400">Memuat data...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {list.length === 0 && (
                        <div className="bg-white p-16 text-center rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-6xl mb-4">📂</p>
                            <h3 className="text-xl font-bold text-slate-600">Semua Bersih!</h3>
                            <p className="text-slate-400">Tidak ada pembayaran menunggu verifikasi.</p>
                        </div>
                    )}

                    {list.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-lg transition duration-300">
                            
                            {/* Kiri: Bukti Bayar */}
                            <div className="w-full md:w-1/3">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <span>📷</span> Bukti Transfer
                                </p>
                                <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 group relative">
                                    {/* 👇 Menggunakan API_URL untuk path gambar */}
                                    <a href={`${API_URL}/uploads/${item.bukti_bayar}`} target="_blank" rel="noreferrer" className="block relative overflow-hidden rounded-lg">
                                        <Image
                                            src={`${API_URL}/uploads/${item.bukti_bayar}`}
                                            alt="Bukti Bayar"
                                            width={400}
                                            height={300}
                                            className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500 cursor-zoom-in"
                                            unoptimized={true} 
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 font-bold bg-black/50 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                                Lihat Asli
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            {/* Kanan: Info & Aksi */}
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
                                        <span className="text-sm font-semibold text-sky-800">Total Nominal:</span>
                                        <span className="text-3xl font-black text-sky-700">Rp {item.total_bayar.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={() => openConfirmModal(item, 'TERIMA')}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition transform active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        TERIMA (LUNAS)
                                    </button>

                                    <button
                                        onClick={() => openConfirmModal(item, 'TOLAK')}
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

            {/* --- MODAL CONFIRMATION (POPUP) --- */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform scale-100 transition-all">
                        
                        <div className="text-center mb-6">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${actionType === 'TERIMA' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {actionType === 'TERIMA' ? (
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-800">
                                {actionType === 'TERIMA' ? 'Konfirmasi Pelunasan' : 'Tolak Bukti Bayar'}
                            </h3>
                            <p className="text-slate-500 mt-2 text-sm">
                                {actionType === 'TERIMA' 
                                    ? `Pastikan dana Rp ${selectedItem.total_bayar.toLocaleString()} sudah masuk ke rekening.` 
                                    : `Anda akan menolak bukti dari ${selectedItem.userName}.`
                                }
                            </p>
                        </div>

                        {/* Input Alasan Jika Tolak */}
                        {actionType === 'TOLAK' && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Alasan Penolakan <span className="text-red-500">*</span></label>
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Contoh: Foto buram, Nominal kurang, dll..."
                                    className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm h-24 resize-none"
                                ></textarea>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                disabled={processing}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleProcess}
                                disabled={processing}
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition flex justify-center items-center gap-2 ${
                                    actionType === 'TERIMA' 
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200' 
                                    : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                                }`}
                            >
                                {processing ? 'Memproses...' : (actionType === 'TERIMA' ? 'Ya, Valid' : 'Tolak')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}