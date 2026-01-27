"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import {
    LayoutDashboard,
    LogOut,
    Mail,
    Search,
    Printer,
    TrendingUp,
    Users,
    Droplets,
    Wallet,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'



// 👇 Import Helper
import { getAuthToken, getUserRole, removeAuthToken } from "@/utils/cookies"

// --- KONFIGURASI API (Ganti IP di sini agar sesuai) ---
const API_URL = process.env.NEXT_PUBLIC_API_URL
// Jika testing via HP/Jaringan lain, ganti localhost dengan IP Laptop, misal: "http://192.168.1.5:8000"

// --- Tipe Data ---
interface IStats {
    total_pendapatan: number;
    total_pelanggan: number;
    transaksi_lunas: number;
    transaksi_tunggakan: number;
    total_air: number;
    unread_pengaduan: number;
}

interface ITagihan {
    id: number;
    user: { name: string; email: string };
    bulan: string;
    tahun: number;
    total_bayar: number;
    status_bayar: string;
    meter_awal: number;
    meter_akhir: number;
}

// --- Komponen Skeleton Loading ---
const DashboardSkeleton = () => (
    <div className="p-6 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 bg-slate-200 w-1/3 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
    </div>
)

export default function ManagerDashboard() {
    const [stats, setStats] = useState<IStats | null>(null)
    const [transaksi, setTransaksi] = useState<ITagihan[]>([])
    const [managerName, setManagerName] = useState("")
    const [loading, setLoading] = useState(true)

    // State untuk Filter & Search
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")

    const router = useRouter()

    useEffect(() => {
        const token = getAuthToken()
        const role = getUserRole()
        const name = localStorage.getItem("name")

        if (!token) {
            router.replace("/login")
            return
        }

        if (role !== "MANAGER") {
            toast.error("Akses Ditolak. Area Terbatas.")
            router.replace("/login")
            return
        }

        if (name) setManagerName(name)
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        try {
            const token = getAuthToken()
            // 👇 MENGGUNAKAN API_URL AGAR DINAMIS
            const res = await fetch(`${API_URL}/manager/dashboard`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            const data = await res.json()
            if (data.status) {
                setStats(data.stats)
                setTransaksi(data.data)
            } else {
                toast.error(data.message || "Gagal memuat data")
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Gagal terhubung ke server.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        if (!confirm("Keluar dari Executive Dashboard?")) return;
        removeAuthToken()
        localStorage.removeItem("name")
        toast.success("Logout Berhasil")
        router.push('/')
    }

    // --- Logic Filter & Search ---
    const filteredTransaksi = useMemo(() => {
        return transaksi.filter(item => {
            const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "ALL" || item.status_bayar === filterStatus;

            return matchesSearch && matchesStatus;
        })
    }, [transaksi, searchTerm, filterStatus])

    // --- Mock Data Chart (Kombinasi data real & dummy untuk visualisasi) ---
    const chartData = [
        { name: 'Sep', total: 4000000 },
        { name: 'Okt', total: 3500000 },
        { name: 'Nov', total: 5000000 },
        { name: 'Des', total: 4800000 },
        { name: 'Jan', total: stats?.total_pendapatan || 0 }, // Data Real Bulan Ini
    ];

    const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

    if (loading) return <DashboardSkeleton />

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-12">

            {/* --- TOPBAR --- */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <LayoutDashboard size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900 leading-none">PDAM Pintar</h1>
                            <span className="text-[10px] font-semibold text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">EXECUTIVE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-700">{managerName}</span>
                            <span className="text-[10px] text-slate-400">Manager Operasional</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="px-6 py-8 max-w-7xl mx-auto space-y-8">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Overview Kinerja</h2>
                        <p className="text-slate-500 text-sm">Update data real-time hari ini.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/manager/pengaduan" className="relative group bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-300 transition flex items-center gap-2 shadow-sm">
                            <Mail size={16} />
                            <span>Massage</span>
                            {stats && stats.unread_pengaduan > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                    {stats.unread_pengaduan}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200">
                            <Printer size={16} />
                            <span>Laporan PDF</span>
                        </button>
                    </div>
                </div>

                {/* --- 1. STATISTIC CARDS (KPI) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* Card: Pendapatan */}
                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <Wallet size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                +12% <ArrowUpRight size={12} className="ml-1" />
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pendapatan</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stats ? formatRp(stats.total_pendapatan) : "Rp 0"}</h3>
                    </div>

                    {/* Card: Volume Air */}
                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-sky-50 p-2.5 rounded-xl text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                                <Droplets size={24} />
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Volume Terjual</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">
                            {stats?.total_air?.toLocaleString('id-ID') ?? 0} <span className="text-sm font-semibold text-slate-400">m³</span>
                        </h3>
                    </div>

                    {/* Card: Pelanggan */}
                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                <Users size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                +5 Baru
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pelanggan</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.total_pelanggan ?? 0}</h3>
                    </div>

                    {/* Card: Ratio */}
                    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                <TrendingUp size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                {stats?.transaksi_tunggakan} Tertunda
                            </span>
                        </div>
                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1 font-bold text-slate-600">
                                <span>Progress Bayar</span>
                                <span>{stats ? Math.round((stats.transaksi_lunas / (stats.transaksi_lunas + stats.transaksi_tunggakan || 1)) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-linear-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000"
                                    style={{ width: stats ? `${(stats.transaksi_lunas / (stats.transaksi_lunas + stats.transaksi_tunggakan || 1)) * 100}%` : '0%' }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. CHART SECTION (VISUALISASI) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:break-inside-avoid">
                    {/* Grafik Pendapatan */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Tren Pendapatan</h3>
                            <p className="text-sm text-slate-500">Analisa pemasukan 5 bulan terakhir.</p>
                        </div>
                        <div className="h-62.5 w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `${val / 1000000}jt`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number | undefined) => value !== undefined ? formatRp(value) : 'Rp 0'}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ringkasan Status */}
                    <div className="bg-indigo-900 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full -ml-5 -mb-5 blur-xl"></div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-1">Status Keuangan</h3>
                            <p className="text-indigo-200 text-sm mb-6">Bulan Januari 2026</p>

                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300"><Wallet size={18} /></div>
                                        <span className="text-sm font-medium">Lunas</span>
                                    </div>
                                    <span className="font-bold">{stats?.transaksi_lunas} Transaksi</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-500/20 p-2 rounded-lg text-red-300"><ArrowDownRight size={18} /></div>
                                        <span className="text-sm font-medium">Belum Bayar</span>
                                    </div>
                                    <span className="font-bold">{stats?.transaksi_tunggakan} Transaksi</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-xs text-indigo-300">Target bulan ini tercapai 85%</p>
                        </div>
                    </div>
                </div>

                {/* --- 3. TABLE SECTION (INTERAKTIF) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">

                    {/* Toolbar Table */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                        <h3 className="font-bold text-lg text-slate-800">Riwayat Transaksi</h3>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Cari nama / ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="LUNAS">Lunas</option>
                                    <option value="BELUM_BAYAR">Belum Bayar</option>
                                    <option value="MENUNGGU_VERIFIKASI">Verifikasi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Tagihan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransaksi.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search size={32} className="mb-2 opacity-50" />
                                                <p>Data tidak ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransaksi.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition duration-150 group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition">#{item.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
                                                        {item.user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{item.user.name}</p>
                                                        <p className="text-xs text-slate-400">{item.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-700">{item.bulan} {item.tahun}</p>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                                    {item.meter_akhir - item.meter_awal} m³
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{formatRp(item.total_bayar)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.status_bayar === 'LUNAS' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LUNAS
                                                    </span>
                                                )}
                                                {item.status_bayar === 'MENUNGGU_VERIFIKASI' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> VERIFIKASI
                                                    </span>
                                                )}
                                                {item.status_bayar === 'BELUM_BAYAR' && (
                                                    <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> BELUM BAYAR
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    )
}