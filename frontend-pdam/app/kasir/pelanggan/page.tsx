"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast, { Toaster } from "react-hot-toast"
import SidebarKasir from "@/components/Kasir/SidebarKasir"
import { getAuthToken, getUserRole } from "@/utils/cookies"
import {
    Users, Search, UserPlus, Edit3, Trash2,
    MapPin, RefreshCw, X
} from "lucide-react"

interface Pelanggan {
    id: number
    name: string
    email: string
    address: string
}

export default function KelolaPelangganPage() {
    const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [kasirName, setKasirName] = useState("")

    // State untuk Form (Tambah/Edit)
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [formUser, setFormUser] = useState({
        name: "", email: "", password: "", address: ""
    })

    const router = useRouter()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // --- FETCH DATA ---
    const fetchPelanggan = useCallback(async () => {
        setLoading(true)
        try {
            const token = getAuthToken()
            const res = await fetch(`${API_URL}/users/pelanggan`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.status) setPelanggan(data.data)
        } catch (error) {
            toast.error("Gagal memuat data pelanggan")
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
        setKasirName(localStorage.getItem("name") || "Kasir")
        fetchPelanggan()
    }, [router, fetchPelanggan])

    // --- FILTER ---
    const filteredPelanggan = useMemo(() => {
        return pelanggan.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [pelanggan, searchTerm])

    // --- ACTIONS ---
    const handleOpenAdd = () => {
        setEditId(null)
        setFormUser({ name: "", email: "", password: "", address: "" })
        setShowForm(true)
    }

    const handleOpenEdit = (p: Pelanggan) => {
        setEditId(p.id)
        setFormUser({ name: p.name, email: p.email, address: p.address, password: "" })
        setShowForm(true)
    }

    const handleDelete = (id: number) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="font-bold text-slate-800 text-sm">Hapus pelanggan ini?</p>
                <div className="flex gap-2">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold">Batal</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id)
                        const load = toast.loading("Menghapus...")
                        try {
                            const res = await fetch(`${API_URL}/user/${id}`, {
                                method: 'DELETE',
                                headers: { "Authorization": `Bearer ${getAuthToken()}` }
                            })
                            const data = await res.json()
                            if (data.status) {
                                toast.success("Berhasil dihapus", { id: load })
                                fetchPelanggan()
                            } else toast.error(data.message, { id: load })
                        } catch (e) { toast.error("Error koneksi", { id: load }) }
                    }} className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-bold">Hapus</button>
                </div>
            </div>
        ), { duration: 5000 })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const loadingToast = toast.loading("Menyimpan...")
        try {
            const method = editId ? 'PUT' : 'POST'
            const url = editId ? `${API_URL}/user/${editId}` : `${API_URL}/user`
            // Jika edit dan password kosong, hapus field password agar tidak terupdate jadi string kosong
            const bodyData = { ...formUser, role: 'PELANGGAN' } as Record<string, unknown>
            if (editId && !formUser.password) delete bodyData.password

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(bodyData)
            })
            const data = await res.json()
            toast.dismiss(loadingToast)

            if (data.status) {
                toast.success(editId ? "Data diperbarui" : "Pelanggan baru ditambahkan")
                setShowForm(false)
                fetchPelanggan()
            } else toast.error(data.message)
        } catch (e) { toast.error("Koneksi gagal") }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-x-hidden">
            <Toaster position="top-center" />

            {/* SIDEBAR - Pastikan lebar di SidebarKasir adalah w-64 atau disesuaikan */}
            <SidebarKasir
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={() => router.push('/')}
            />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">

                {/* HEADER */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                        >
                            <Users size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg lg:text-xl font-black text-slate-800 leading-tight">Database Pelanggan</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kasir: <span className="text-blue-600">{kasirName}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        <UserPlus size={18} /> <span className="hidden sm:inline">Tambah Pelanggan</span>
                    </button>
                </header>

                <div className="p-4 lg:p-10 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pelanggan</p>
                                <p className="text-xl font-black text-slate-800">{pelanggan.length} <span className="text-sm font-normal text-slate-400 italic">Orang</span></p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Sistem</p>
                                <p className="text-xl font-black text-emerald-600 uppercase tracking-widest">Sinkron</p>
                            </div>
                        </div>
                    </div>

                    {/* FILTER & SEARCH */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                            />
                        </div>
                        <button onClick={fetchPelanggan} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors text-slate-500">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center text-slate-400 font-medium">Memuat data...</div>
                        ) : filteredPelanggan.length === 0 ? (
                            <div className="p-20 text-center">
                                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">Pelanggan tidak ditemukan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Pelanggan</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredPelanggan.map((p) => (
                                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                                                            {p.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                                                            <p className="text-[11px] text-blue-600 font-medium">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-2 max-w-[200px] lg:max-w-xs">
                                                        <MapPin size={12} className="text-slate-300 mt-1 shrink-0" />
                                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.address}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenEdit(p)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors">
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL FORM */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                {editId ? 'Edit Pelanggan' : 'Daftar Pelanggan Baru'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nama Lengkap</label>
                                <input required value={formUser.name} onChange={e => setFormUser({ ...formUser, name: e.target.value })} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="Nama pelanggan..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Email Aktif</label>
                                <input required value={formUser.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="email@contoh.com" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                                    Password {editId && <span className="text-[9px] text-rose-400">(Kosongkan jika tidak diganti)</span>}
                                </label>
                                <input required={!editId} value={formUser.password} onChange={e => setFormUser({ ...formUser, password: e.target.value })} type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="Min 6 karakter..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Alamat Lengkap</label>
                                <textarea required value={formUser.address} onChange={e => setFormUser({ ...formUser, address: e.target.value })} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium resize-none" placeholder="Alamat pelanggan..."></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Batal</button>
                                <button type="submit" className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
                                    {editId ? 'Simpan Perubahan' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}