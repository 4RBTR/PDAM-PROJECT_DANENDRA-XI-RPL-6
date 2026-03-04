"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
    Search,
    Trash2,
    RefreshCcw,
    Inbox,
    UserCheck,
    Globe,
    Image as ImageIcon,
    CheckCircle2,
    Send,
    X,
    MessageCircle,
    MessageSquare
} from "lucide-react"

// 👇 Import Helper & Sidebar
import { getAuthToken, getUserRole, removeAuthToken } from "@/utils/cookies"
import SidebarManager from "@/components/Manager/SidebarManager"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface IPengaduan {
    id: number;
    nama: string;
    email: string;
    judul?: string;
    pesan: string;
    tanggapan?: string | null;
    foto?: string | null;
    status?: string;
    userId?: number | null;
    createdAt: string;
    source: "PUBLIC" | "USER";
}

interface IApiPengaduan {
    id: number;
    user?: { name: string; email: string };
    nama?: string;
    email?: string;
    judul?: string;
    deskripsi?: string;
    pesan?: string;
    tanggapan?: string | null;
    foto?: string | null;
    status?: string;
    userId?: number | null;
    createdAt?: string;
    created_at?: string;
}

const formatRealTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date).replace('.', ':');
}

const InboxSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="h-20 w-full bg-slate-100 rounded-2xl" />
                </div>
            </div>
        ))}
    </div>
)

export default function ManagerInbox() {
    const [messages, setMessages] = useState<IPengaduan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"ALL" | "USER" | "PUBLIC">("ALL")
    const [managerName, setManagerName] = useState("")

    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState<IPengaduan | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isSending, setIsSending] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()
        const name = localStorage.getItem("name")

        if (!token || role !== "MANAGER") {
            router.replace("/login")
            return
        }

        if (name) setManagerName(name)
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        setLoading(true)
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/manager/pengaduan`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.status) {
                const formattedData: IPengaduan[] = data.data.map((item: IApiPengaduan) => ({
                    id: item.id,
                    nama: item.user ? item.user.name : item.nama,
                    email: item.user ? item.user.email : item.email,
                    judul: item.judul || "Pesan Umum",
                    pesan: item.deskripsi || item.pesan,
                    tanggapan: item.tanggapan,
                    foto: item.foto,
                    status: item.status || "PENDING",
                    userId: item.userId,
                    createdAt: item.createdAt || item.created_at,
                    source: item.userId ? "USER" : "PUBLIC"
                }))
                setMessages(formattedData.reverse())
            }
        } catch (error) {
            toast.error("Gagal memuat pesan")
        } finally {
            setLoading(false)
        }
    }

    const filteredMessages = useMemo(() => {
        return messages.filter(msg => {
            const matchType = filterType === "ALL" ? true : msg.source === filterType;
            const lowerSearch = searchTerm.toLowerCase();
            const matchSearch =
                msg.nama.toLowerCase().includes(lowerSearch) ||
                msg.email.toLowerCase().includes(lowerSearch) ||
                msg.pesan.toLowerCase().includes(lowerSearch) ||
                (msg.judul && msg.judul.toLowerCase().includes(lowerSearch));
            return matchType && matchSearch;
        })
    }, [messages, searchTerm, filterType])

    const executeDelete = (id: number) => {
        // Memunculkan toast custom dengan tombol konfirmasi
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="flex items-center gap-2 text-rose-600">
                    <Trash2 size={18} strokeWidth={3} />
                    <span className="font-black text-sm uppercase tracking-tight">Hapus Pesan?</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Pesan ID <span className="font-bold text-slate-800">#{id}</span> akan dihapus permanen dari sistem.
                </p>
                <div className="flex gap-2 mt-1">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id); // Tutup toast konfirmasi
                            const loadingToast = toast.loading("Sedang menghapus...");

                            try {
                                const token = getAuthToken();
                                const res = await fetch(`${API_BASE_URL}/manager/pengaduan/${id}`, {
                                    method: 'DELETE',
                                    headers: { "Authorization": `Bearer ${token}` }
                                });
                                const data = await res.json();

                                if (data.status) {
                                    setMessages(prev => prev.filter(msg => msg.id !== id));
                                    toast.success("Pesan berhasil dibuang!", { id: loadingToast });
                                } else {
                                    toast.error("Gagal menghapus pesan", { id: loadingToast });
                                }
                            } catch (error) {
                                toast.error("Masalah koneksi server", { id: loadingToast });
                            }
                        }}
                        className="flex-1 bg-rose-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                    >
                        Ya, Hapus
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
            style: {
                borderRadius: '1.5rem',
                padding: '16px',
                border: '1px solid #f1f5f9',
                minWidth: '280px'
            }
        });
    };

    const handleLogout = () => {
        removeAuthToken()
        localStorage.removeItem("name")
        router.push('/')
    }

    const openReplyModal = (msg: IPengaduan) => {
        setSelectedMessage(msg)
        setReplyText(msg.tanggapan || "")
        setIsReplyModalOpen(true)
    }

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedMessage) return toast.error("Isi balasan dulu");
        setIsSending(true)
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE_URL}/manager/pengaduan/${selectedMessage.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "SELESAI", tanggapan: replyText })
            })
            const data = await res.json()
            if (data.status) {
                toast.success("Balasan terkirim!");
                setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: "SELESAI", tanggapan: replyText } : m))
                setIsReplyModalOpen(false)
            }
        } catch (error) {
            toast.error("Gagal mengirim")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#F4F7FE]">
            {/* --- SIDEBAR TETAP ADA --- */}
            <SidebarManager managerName={managerName} onLogout={handleLogout} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <MessageSquare className="text-indigo-600" /> Kotak Masuk Pengaduan
                            </h1>
                            <p className="text-slate-500 text-sm">Kelola semua laporan dan feedback dari masyarakat.</p>
                        </div>
                        <button
                            onClick={() => fetchMessages()}
                            className="p-3 text-indigo-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition shadow-sm"
                        >
                            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                        <div className="lg:col-span-8 flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                            <button onClick={() => setFilterType("ALL")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 flex-1 justify-center whitespace-nowrap ${filterType === "ALL" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}>
                                <Inbox size={14} /> SEMUA
                            </button>
                            <button onClick={() => setFilterType("USER")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 flex-1 justify-center whitespace-nowrap ${filterType === "USER" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-indigo-600"}`}>
                                <UserCheck size={14} /> PELANGGAN
                            </button>
                            <button onClick={() => setFilterType("PUBLIC")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 flex-1 justify-center whitespace-nowrap ${filterType === "PUBLIC" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-orange-600"}`}>
                                <Globe size={14} /> TAMU/UMUM
                            </button>
                        </div>
                        <div className="lg:col-span-4 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari laporan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Message List */}
                    <div className="space-y-4">
                        {loading ? <InboxSkeleton /> : filteredMessages.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">Tidak ada pesan pengaduan ditemukan.</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div key={msg.id} className="group bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden relative">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.status === 'SELESAI' ? 'bg-emerald-500' : msg.source === 'USER' ? 'bg-indigo-500' : 'bg-orange-400'}`} />

                                    <div className="p-6 pl-8 flex flex-col md:flex-row gap-6">
                                        {/* Left: Avatar & Status */}
                                        <div className="shrink-0 flex flex-col items-center gap-3">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20 ${msg.source === 'USER' ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                                                {msg.nama.charAt(0).toUpperCase()}
                                            </div>
                                            {msg.status === 'SELESAI' && (
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1 uppercase tracking-tighter">
                                                    <CheckCircle2 size={10} /> Selesai
                                                </span>
                                            )}
                                        </div>

                                        {/* Middle: Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-black text-slate-800 flex flex-wrap items-center gap-2">
                                                        {msg.nama}
                                                        <span className="hidden md:block text-slate-200 font-light">|</span>
                                                        <span className="text-xs font-bold text-slate-400">{msg.email}</span>
                                                    </h3>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {formatRealTime(msg.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {msg.foto && (
                                                        <a href={`${API_BASE_URL}/uploads/${msg.foto}`} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition">
                                                            <ImageIcon size={18} />
                                                        </a>
                                                    )}
                                                    <button onClick={() => executeDelete(msg.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 leading-relaxed border border-slate-100 font-medium">
                                                {msg.source === 'USER' && <div className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest underline decoration-indigo-200">{msg.judul}</div>}
                                                {msg.pesan}
                                            </div>

                                            {/* Footer: Response */}
                                            {msg.tanggapan ? (
                                                <div className="mt-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 relative group-hover:bg-emerald-50 transition-colors">
                                                    <h4 className="text-[10px] font-black text-emerald-700 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                                        <CheckCircle2 size={12} /> Ditanggapi oleh Manager
                                                    </h4>
                                                    <p className="text-sm text-emerald-800 font-medium italic">&quot;{msg.tanggapan}&quot;</p>
                                                </div>
                                            ) : (
                                                <div className="mt-5 flex justify-end">
                                                    <button
                                                        onClick={() => openReplyModal(msg)}
                                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-indigo-200 active:scale-95 uppercase tracking-widest"
                                                    >
                                                        <MessageCircle size={14} /> Beri Tanggapan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* --- MODAL BALASAN (TIDAK BERUBAH) --- */}
            {isReplyModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-xl text-slate-900">Beri Tanggapan</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Kepada: {selectedMessage.nama}</p>
                            </div>
                            <button onClick={() => setIsReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="bg-indigo-50 p-4 rounded-2xl text-xs text-indigo-700 mb-6 border-l-4 border-indigo-500 italic font-medium">
                                &quot;{selectedMessage.pesan.length > 120 ? selectedMessage.pesan.substring(0, 120) + '...' : selectedMessage.pesan}&quot;
                            </div>

                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Pesan Balasan</label>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Ketik solusi atau tanggapan di sini..."
                                className="w-full h-36 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium resize-none transition-all outline-none"
                            ></textarea>

                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                                <CheckCircle2 size={14} />
                                <span>Status akan otomatis berubah menjadi <b className="underline">SELESAI</b> setelah dikirim.</span>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsReplyModalOpen(false)}
                                className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={isSending}
                                className="px-8 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xl shadow-indigo-200 flex items-center gap-2 transition disabled:opacity-50 uppercase tracking-widest"
                            >
                                {isSending ? "Mengirim..." : <><Send size={14} /> Kirim Sekarang</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}