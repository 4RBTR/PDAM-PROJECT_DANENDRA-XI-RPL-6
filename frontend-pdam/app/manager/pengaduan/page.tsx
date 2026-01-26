"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
    ArrowLeft,
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
    MessageCircle
} from "lucide-react"

// 👇 Import Helper Cookies
import { getAuthToken, getUserRole } from "@/utils/cookies"

// ==========================================
// 👇 KONFIGURASI API (MENGGUNAKAN ENV)
// ==========================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// --- INTERFACE UPDATE ---
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

// --- HELPER: Real Time Formatter ---
const formatRealTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date).replace('.', ':');
}

// --- COMPONENT SKELETON ---
const InboxSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="h-16 w-full bg-slate-100 rounded-lg" />
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

    // 👇 STATE UNTUK MODAL BALASAN
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState<IPengaduan | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isSending, setIsSending] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const role = getUserRole()
        if (role !== "MANAGER") {
            // Handle redirect logic here
            // router.push("/login") 
        }
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedData: IPengaduan[] = data.data.map((item: any) => ({
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
            console.error(error)
            toast.error("Gagal memuat pesan")
        } finally {
            setLoading(false)
        }
    }

    // --- Filter Logic ---
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

    // --- Logic 1: DELETE (Hard Delete) ---
    const executeDelete = async (id: number) => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_BASE_URL}/manager/pengaduan/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.status) {
                setMessages(prev => prev.filter(msg => msg.id !== id))
                toast.success("Pesan dihapus permanen")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error sistem")
        }
    }

    // --- Logic 2: REPLY (Update Status & Add Response) ---
    const openReplyModal = (msg: IPengaduan) => {
        setSelectedMessage(msg)
        setReplyText(msg.tanggapan || "")
        setIsReplyModalOpen(true)
    }

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedMessage) return toast.error("Isi pesan balasan dulu");

        setIsSending(true)
        const token = getAuthToken();

        try {
            const res = await fetch(`${API_BASE_URL}/manager/pengaduan/${selectedMessage.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: "SELESAI",
                    tanggapan: replyText
                })
            })

            const data = await res.json()

            if (data.status) {
                toast.success("Balasan terkirim & Status Update!");

                // Update UI State tanpa reload
                setMessages(prev => prev.map(m =>
                    m.id === selectedMessage.id
                        ? { ...m, status: "SELESAI", tanggapan: replyText }
                        : m
                ))
                setIsReplyModalOpen(false)
                setReplyText("")
                setSelectedMessage(null)
            } else {
                toast.error(data.message || "Gagal mengirim balasan")
            }
        } catch (error) {
            console.error(error)
            toast.error("Gagal terhubung ke server")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/80 font-sans text-slate-800 pb-20">

            {/* HEADER NAVBAR */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 bg-opacity-90 backdrop-blur-md shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 leading-tight">Kotak Masuk</h1>
                            <p className="text-xs text-slate-500 font-medium">Manager Dashboard</p>
                        </div>
                    </div>
                    <button onClick={() => fetchMessages()} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition shadow-sm border border-indigo-100">
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

                {/* --- FILTERS --- */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    {/* Filter Buttons */}
                    <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex w-full md:w-auto overflow-x-auto">
                        <button onClick={() => setFilterType("ALL")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 flex-1 justify-center ${filterType === "ALL" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                            <Inbox size={16} /> Semua
                        </button>
                        <button onClick={() => setFilterType("USER")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 flex-1 justify-center ${filterType === "USER" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                            <UserCheck size={16} /> Pelanggan
                        </button>
                        <button onClick={() => setFilterType("PUBLIC")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 flex-1 justify-center ${filterType === "PUBLIC" ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                            <Globe size={16} /> Tamu
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" />
                    </div>
                </div>

                {/* --- MESSAGE LIST --- */}
                <div className="space-y-4">
                    {loading ? <InboxSkeleton /> : filteredMessages.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">Tidak ada pesan.</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div key={msg.id} className="group bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                                {/* Status Strip Color */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${msg.status === 'SELESAI' ? 'bg-green-500' : msg.source === 'USER' ? 'bg-blue-500' : 'bg-orange-400'}`} />

                                <div className="p-5 pl-7 md:pl-8 flex flex-col md:flex-row gap-5">
                                    {/* Avatar */}
                                    <div className="shrink-0 flex flex-col items-center gap-2">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md ${msg.source === 'USER' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                                            {msg.nama.charAt(0).toUpperCase()}
                                        </div>
                                        {msg.status === 'SELESAI' && (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Selesai
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                    {msg.nama} <span className="text-slate-300 font-normal">|</span> <span className="text-sm font-medium text-slate-500">{msg.email}</span>
                                                </h3>
                                                <div className="flex gap-2 mt-1 text-xs text-slate-500 font-mono">
                                                    <span>{formatRealTime(msg.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* ACTION BUTTONS */}
                                            <div className="flex items-center gap-2">
                                                {msg.foto && (
                                                    <a href={`${API_BASE_URL}/uploads/${msg.foto}`} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
                                                        <ImageIcon size={18} />
                                                    </a>
                                                )}
                                                <button onClick={() => executeDelete(msg.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Permanen">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className="mt-3 bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100">
                                            {msg.source === 'USER' && <div className="text-xs font-bold text-slate-400 mb-1 uppercase">{msg.judul}</div>}
                                            {msg.pesan}
                                        </div>

                                        {/* TANGGAPAN SECTION */}
                                        {msg.tanggapan ? (
                                            <div className="mt-3 ml-4 bg-green-50 p-4 rounded-xl border border-green-100 relative">
                                                <div className="absolute -left-2 top-4 w-4 h-4 bg-green-50 border-l border-b border-green-100 transform rotate-45"></div>
                                                <h4 className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Dibalas oleh Manager
                                                </h4>
                                                <p className="text-sm text-green-800">{msg.tanggapan}</p>
                                            </div>
                                        ) : (
                                            // Button Balas (Hanya Muncul jika belum dibalas)
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    onClick={() => openReplyModal(msg)}
                                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-indigo-200"
                                                >
                                                    <MessageCircle size={16} />
                                                    Balas & Konfirmasi
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* --- MODAL BALASAN --- */}
            {isReplyModalOpen && selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Balas Pengaduan</h3>
                                <p className="text-xs text-slate-500">Kirim balasan ke {selectedMessage.nama}</p>
                            </div>
                            <button onClick={() => setIsReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Preview Pesan User */}
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4 border-l-4 border-indigo-500 italic">
                                &quot;{selectedMessage.pesan.length > 100 ? selectedMessage.pesan.substring(0, 100) + '...' : selectedMessage.pesan}&quot;
                            </div>

                            <label className="block text-sm font-bold text-slate-700 mb-2">Isi Balasan Anda</label>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Contoh: Terima kasih atas laporan Anda, tim kami akan segera memperbaikinya..."
                                className="w-full h-32 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            ></textarea>

                            <div className="mt-4 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                                <CheckCircle2 size={14} />
                                <span>Tindakan ini akan mengubah status menjadi <b>SELESAI</b>.</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsReplyModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={isSending}
                                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <>Loading...</>
                                ) : (
                                    <>
                                        <Send size={16} /> Kirim Balasan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}