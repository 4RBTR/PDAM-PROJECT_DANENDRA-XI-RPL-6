"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface IPengaduan {
    id: number;
    nama: string;
    email: string;
    pesan: string;
    isRead: boolean;
    createdAt: string;
}

export default function ManagerInbox() {
    const [messages, setMessages] = useState<IPengaduan[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // --- PROTEKSI ROLE (Sama seperti Dashboard) ---
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("role")

        if (!token) {
            router.push("/login")
            return
        }

        if (role !== "MANAGER") {
            // Jika bukan manager, kembalikan ke tempat asal atau login
            if (role === "PELANGGAN") router.push("/pelanggan/dashboard")
            else router.push("/login")
            return
        }

        fetchMessages()
    }, [router])

    const fetchMessages = async () => {
        try {
            const res = await fetch("http://localhost:8000/manager/pengaduan")
            const data = await res.json()
            if (data.status) {
                setMessages(data.data)
            }
        } catch (error) {
            console.error("Error fetch messages", error)
        } finally {
            setLoading(false)
        }
    }

    // --- FUNGSI HAPUS PESAN ---
    const handleDelete = async (id: number) => {
        // 1. Konfirmasi dulu biar gak salah hapus
        if (!confirm("Apakah Anda yakin ingin menghapus pesan ini secara permanen?")) return;

        try {
            // 2. Panggil API Backend
            const res = await fetch(`http://localhost:8000/manager/pengaduan/${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.status) {
                // 3. Hapus dari layar tanpa reload halaman (UI Optimistic)
                setMessages(prev => prev.filter(msg => msg.id !== id))
                toast.success("Pesan berhasil dihapus.")
            } else {
                toast.error("Gagal menghapus pesan: " + data.message)
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Terjadi kesalahan sistem saat menghapus pesan.")
        }
    }

    // Format Tanggal (Contoh: 20 Jan 2024, 10:30)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
            {/* NAVBAR SIMPLE */}
            <nav className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/manager/dashboard')}
                        className="flex items-center gap-2 hover:bg-slate-700 px-3 py-2 rounded-lg transition text-sm font-bold"
                    >
                        <span>⬅</span> Kembali ke Dashboard
                    </button>
                </div>
                <h1 className="font-bold text-lg hidden md:block">Kotak Masuk Pengaduan</h1>
                <div className="w-8"></div> {/* Spacer agar judul di tengah */}
            </nav>

            <main className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
                <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Daftar Pesan Masuk</h2>
                        <p className="text-slate-500 text-sm mt-1">Keluhan dan masukan dari pelanggan.</p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-full text-xs shadow-sm">
                        Total: {messages.length} Pesan
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-slate-400">Memuat pesan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-6xl mb-4">📭</p>
                        <p className="text-slate-500 font-bold text-lg">Belum ada pesan masuk</p>
                        <p className="text-slate-400 text-sm">Kotak masuk Anda bersih.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition relative group">

                                {/* HEADER PESAN */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar Inisial */}
                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                            {msg.nama.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 leading-tight">{msg.nama}</h3>
                                            <p className="text-sm text-indigo-500 font-medium">{msg.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>

                                {/* ISI PESAN */}
                                <div className="pl-16">
                                    <div className="bg-slate-50 p-5 rounded-r-2xl rounded-bl-2xl text-slate-700 text-sm leading-relaxed border border-slate-100 italic">
                                        &quot;{msg.pesan}&quot;
                                    </div>
                                </div>

                                {/* TOMBOL HAPUS */}
                                <div className="mt-4 flex justify-end pl-16">
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                        Hapus Pesan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}