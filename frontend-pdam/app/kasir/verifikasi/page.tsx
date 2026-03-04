"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast, { Toaster } from "react-hot-toast"
import { getAuthToken, getUserRole } from "@/utils/cookies"
import SidebarKasir from "@/components/Kasir/SidebarKasir"
import { 
    Menu, 
    CheckCircle, 
    XCircle, 
    ExternalLink, 
    Search, 
    Clock, 
    AlertCircle,
    ChevronRight
} from "lucide-react"

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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const router = useRouter()

    // --- STATE ---
    const [list, setList] = useState<ITagihanVerifikasi[]>([])
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // --- STATE MODAL & PROSES ---
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ITagihanVerifikasi | null>(null)
    const [actionType, setActionType] = useState<'TERIMA' | 'TOLAK' | null>(null)
    const [catatan, setCatatan] = useState("")

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const token = getAuthToken()
            const res = await fetch(`${API_URL}/tagihan/verifikasi/list`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.status) setList(data.data)
        } catch (error) {
            toast.error("Gagal memuat data verifikasi")
        } finally {
            setLoading(false)
        }
    }, [API_URL])

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()

        if (!token || role !== "KASIR") {
            router.push("/login")
            return
        }
        loadData()
    }, [router, loadData])

    const filteredList = list.filter(item => 
        item.userName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleLogout = () => {
        localStorage.clear()
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        router.push('/')
    }

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
    }

    const handleProcess = async () => {
        if (!selectedItem || !actionType) return;
        if (actionType === 'TOLAK' && catatan.trim().length < 5) {
            toast.error("Mohon isi alasan penolakan!");
            return;
        }

        setProcessing(true)
        try {
            const res = await fetch(`${API_URL}/tagihan/verifikasi/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ aksi: actionType, catatan })
            })
            const data = await res.json()
            if (data.status) {
                toast.success(actionType === 'TERIMA' ? "Pembayaran Disetujui" : "Pembayaran Ditolak")
                setList(prev => prev.filter(i => i.id !== selectedItem.id))
                closeModal()
            } else toast.error(data.message)
        } catch (e) { toast.error("Koneksi gagal") }
        finally { setProcessing(false) }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            <Toaster position="top-center" />

            {/* Sidebar Komponen */}
            <SidebarKasir 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                onLogout={handleLogout} 
            />

            {/* Konten Utama - Penyesuaian lg:ml-72 */}
            <main className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all">
                
                {/* Header Section */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Verifikasi Pembayaran</h1>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Konfirmasi bukti transfer</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:block relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari nama pelanggan..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-8">
                    
                    {/* Status Ringkas */}
                    <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100 flex items-center justify-between overflow-hidden relative">
                        <div className="z-10">
                            <h2 className="text-2xl font-black mb-1 tracking-tight">Antrean Verifikasi</h2>
                            <p className="text-blue-100 text-sm font-medium">Ada <span className="underline decoration-white/50">{list.length} transaksi</span> yang butuh tindakan Anda hari ini.</p>
                        </div>
                        <div className="z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                            <Clock size={32} className="text-white" />
                        </div>
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* List Cards */}
                    {loading ? (
                        <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-sm">Sedang Menyelaraskan Data...</div>
                    ) : filteredList.length === 0 ? (
                        <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Tidak ada antrean</h3>
                            <p className="text-slate-400 text-sm mt-1">Semua bukti pembayaran sudah terverifikasi.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredList.map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group border-l-8 border-l-blue-500">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        {/* Bagian Gambar */}
                                        <div className="w-full lg:w-48 h-48 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                            <Image 
                                                src={`${API_URL}/uploads/${item.bukti_bayar}`}
                                                alt="Bukti Transfer"
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                unoptimized
                                            />
                                            <a 
                                                href={`${API_URL}/uploads/${item.bukti_bayar}`} 
                                                target="_blank" 
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <ExternalLink className="text-white" size={24} />
                                            </a>
                                        </div>

                                        {/* Bagian Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Nama Pelanggan</span>
                                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{item.userName}</h3>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Tagihan</span>
                                                    <p className="font-bold text-slate-600">{item.bulan} {item.tahun}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominal Transfer</p>
                                                    <p className="text-2xl font-black text-slate-800">Rp {item.total_bayar.toLocaleString('id-ID')}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => openConfirmModal(item, 'TERIMA')}
                                                        className="flex-1 h-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                                    >
                                                        <CheckCircle size={18} /> Terima
                                                    </button>
                                                    <button 
                                                        onClick={() => openConfirmModal(item, 'TOLAK')}
                                                        className="flex-1 h-full bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                                    >
                                                        <XCircle size={18} /> Tolak
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Konfirmasi */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${actionType === 'TERIMA' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {actionType === 'TERIMA' ? <CheckCircle size={40} /> : <XCircle size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {actionType === 'TERIMA' ? 'Konfirmasi Lunas' : 'Tolak Bukti Bayar'}
                            </h3>
                            <p className="text-slate-500 text-sm mt-2 font-medium">
                                Anda akan {actionType === 'TERIMA' ? 'mensahkan' : 'menolak'} pembayaran senilai <br/>
                                <span className="font-black text-slate-800">Rp {selectedItem.total_bayar.toLocaleString('id-ID')}</span>
                            </p>
                        </div>

                        {actionType === 'TOLAK' && (
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Alasan Penolakan</label>
                                <textarea 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none"
                                    rows={3}
                                    placeholder="Contoh: Foto buram atau nominal tidak sesuai..."
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button 
                                onClick={closeModal}
                                className="flex-1 py-4 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleProcess}
                                disabled={processing}
                                className={`flex-[2] py-4 rounded-2xl text-sm font-black text-white uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2
                                    ${actionType === 'TERIMA' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}
                                    ${processing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {processing ? 'Memproses...' : (actionType === 'TERIMA' ? 'Sahkan Lunas' : 'Tolak Sekarang')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}