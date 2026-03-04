"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Link from "next/link"
import {
    Mail, Search, Printer, TrendingUp, Users, Wallet,
    Filter, Calendar, Droplets, ChevronLeft,
    ChevronRight, Activity
} from "lucide-react"
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts'

import { getAuthToken, getUserRole, removeAuthToken } from "@/utils/cookies"
import SidebarManager from "@/components/Manager/SidebarManager"

const API_URL = process.env.NEXT_PUBLIC_API_URL

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

const DashboardSkeleton = () => (
    <div className="flex min-h-screen bg-[#F8FAFC]">
        <div className="w-72 hidden lg:block bg-white border-r border-slate-200 p-6 space-y-8">
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 w-full bg-slate-100 rounded-xl animate-pulse"></div>)}
            </div>
        </div>
        <div className="flex-1 p-8 space-y-8">
            <div className="h-20 w-full bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-44 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse"></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-white rounded-3xl shadow-sm border border-slate-100 animate-pulse"></div>
                <div className="h-96 bg-slate-900 rounded-3xl shadow-sm animate-pulse"></div>
            </div>
        </div>
    </div>
)

export default function ManagerDashboard() {
    const [stats, setStats] = useState<IStats | null>(null)
    const [transaksi, setTransaksi] = useState<ITagihan[]>([])
    const [managerName, setManagerName] = useState("")
    const [loading, setLoading] = useState(true)

    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

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
    }, [router])

    const fetchData = async () => {
        try {
            const token = getAuthToken()
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

    const filteredTransaksi = useMemo(() => {
        return transaksi.filter(item => {
            const matchesSearch = item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toString().includes(searchTerm);
            const matchesStatus = filterStatus === "ALL" || item.status_bayar === filterStatus;
            return matchesSearch && matchesStatus;
        })
    }, [transaksi, searchTerm, filterStatus])

    useEffect(() => { setCurrentPage(1) }, [searchTerm, filterStatus])

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredTransaksi.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.max(1, Math.ceil(filteredTransaksi.length / itemsPerPage))

    // ==========================================
    // LOGIKA 100% REAL DATA UNTUK GRAFIK
    // ==========================================
    const realChartData = useMemo(() => {
        if (!transaksi || transaksi.length === 0) return [];

        // Mapping bulan ke angka untuk keperluan sorting (pengurutan) dari yang terlama ke terbaru
        const monthMap: Record<string, number> = {
            "Januari": 1, "Februari": 2, "Maret": 3, "April": 4, "Mei": 5, "Juni": 6,
            "Juli": 7, "Agustus": 8, "September": 9, "Oktober": 10, "November": 11, "Desember": 12
        };

        const grouped: Record<string, { year: number, monthNum: number, aktual: number }> = {};

        // Loop semua transaksi untuk mencari pendapatan asli
        transaksi.forEach(t => {
            if (t.status_bayar === 'LUNAS') {
                // Buat format label seperti "Jan 2024"
                const labelBulan = t.bulan ? t.bulan.substring(0, 3) : "Unk";
                const key = `${labelBulan} ${t.tahun}`;

                if (!grouped[key]) {
                    grouped[key] = {
                        year: t.tahun,
                        monthNum: monthMap[t.bulan] || 0,
                        aktual: 0
                    };
                }
                // Tambahkan total bayar ke bulan tersebut
                grouped[key].aktual += t.total_bayar;
            }
        });

        // Ubah format object menjadi array yang siap dipakai Recharts dan urutkan sesuai waktu
        return Object.entries(grouped)
            .map(([name, data]) => ({
                name,
                year: data.year,
                monthNum: data.monthNum,
                aktual: data.aktual
            }))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.monthNum - b.monthNum;
            });
    }, [transaksi]);

    const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

    if (loading) return <DashboardSkeleton />

    return (
        <div className="flex min-h-screen bg-[#F4F7FE] font-sans text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-700">

            <SidebarManager managerName={managerName} onLogout={handleLogout} />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 space-y-8">

                    {/* --- HEADER --- */}
                    <div className="flex flex-col lg:flex-row justify-between items-end gap-6 pb-2">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-bold mb-3 w-max border border-indigo-100">
                                <Activity size={14} className="animate-pulse" />
                                <span>Live Dashboard</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Kinerja</h2>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                                <Calendar size={14} />
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex gap-3 w-full lg:w-auto">
                            <Link href="/manager/pengaduan" className="relative group bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none">
                                <Mail size={18} />
                                <span>Pesan Masuk</span>
                                {stats && stats.unread_pengaduan > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {stats.unread_pengaduan}
                                    </span>
                                )}
                            </Link>
                            <button onClick={() => window.print()} className="bg-linear-to-r from-slate-900 to-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none">
                                <Printer size={18} />
                                <span className="hidden sm:inline">Export Laporan</span>
                            </button>
                        </div>
                    </div>

                    {/* --- STATISTIC CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        {/* Card 1: Pendapatan */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                        <Wallet size={24} strokeWidth={2} />
                                    </div>
                                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-indigo-100">
                                        Total Kas
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Pendapatan</p>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatRp(stats?.total_pendapatan || 0)}</h3>
                            </div>
                        </div>

                        {/* Card 2: Volume Air */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-linear-to-br from-sky-400 to-sky-500 p-3.5 rounded-2xl text-white shadow-lg shadow-sky-200">
                                        <Droplets size={24} strokeWidth={2} />
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Volume Terjual</p>
                                <div className="flex items-baseline gap-1.5">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.total_air?.toLocaleString('id-ID') || 0}</h3>
                                    <span className="text-base font-bold text-slate-400">m³</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Pelanggan */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-linear-to-br from-purple-500 to-purple-600 p-3.5 rounded-2xl text-white shadow-lg shadow-purple-200">
                                        <Users size={24} strokeWidth={2} />
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Pelanggan</p>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.total_pelanggan || 0}</h3>
                            </div>
                        </div>

                        {/* Card 4: Progress */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-linear-to-br from-rose-400 to-rose-500 p-3.5 rounded-2xl text-white shadow-lg shadow-rose-200">
                                        <TrendingUp size={24} strokeWidth={2} />
                                    </div>
                                    <div className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-100">
                                        {stats?.transaksi_tunggakan || 0} Pending
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-500">
                                        <span className="uppercase tracking-wider">Collection Rate</span>
                                        <span className="text-slate-800">{stats ? Math.round(((stats.transaksi_lunas || 0) / (((stats.transaksi_lunas || 0) + (stats.transaksi_tunggakan || 0)) || 1)) * 100) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                        <div className="bg-linear-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                            style={{ width: stats ? `${((stats.transaksi_lunas || 0) / (((stats.transaksi_lunas || 0) + (stats.transaksi_tunggakan || 0)) || 1)) * 100}%` : '0%' }}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CHART SECTION --- */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 print:break-inside-avoid">
                        {/* Grafik Pendapatan Real */}
                        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="font-extrabold text-xl text-slate-900">Revenue Analytics</h3>
                                    <p className="text-sm text-slate-500 mt-1">Total Pendapatan Riil Berdasarkan Riwayat Transaksi Lunas</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                        <span className="text-slate-600">Pendapatan Aktual</span>
                                    </div>
                                </div>
                            </div>

                            {realChartData.length > 0 ? (
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={realChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }}
                                                tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`}
                                            />
                                            <Tooltip
                                                cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '16px' }}
                                                itemStyle={{ fontWeight: 'bold', fontSize: '14px' }}
                                                formatter={(value: number | undefined) => [formatRp(value ?? 0), "Aktual"]}
                                                labelStyle={{ color: '#64748B', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="aktual"
                                                stroke="#6366F1"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorAktual)"
                                                activeDot={{ r: 8, strokeWidth: 3, stroke: '#fff', fill: '#6366F1', className: 'drop-shadow-md' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-80 w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <Activity className="text-slate-300 mb-3" size={32} />
                                    <p className="text-slate-500 font-medium">Belum ada riwayat transaksi lunas untuk ditampilkan di grafik.</p>
                                </div>
                            )}
                        </div>

                        {/* Ringkasan Status (Dark Mode Card) */}
                        <div className="bg-[#0B1120] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-indigo-900/20 border border-slate-800">
                            {/* Decorative background blobs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full -ml-10 -mb-10 blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-extrabold text-2xl mb-1 tracking-tight">Status Kas</h3>
                                        <p className="text-slate-400 text-sm font-medium">Rekapitulasi Transaksi</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                                        <Activity size={20} className="text-indigo-400" />
                                    </div>
                                </div>

                                <div className="mt-10 space-y-4">
                                    <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-slate-700/50 hover:bg-slate-800 transition-colors group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Telah Lunas</span>
                                        </div>
                                        <span className="font-black text-lg text-emerald-400">{stats?.transaksi_lunas || 0} <span className="text-xs text-slate-500 font-semibold ml-1">TRX</span></span>
                                    </div>
                                    <div className="bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between border border-slate-700/50 hover:bg-slate-800 transition-colors group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)]"></div>
                                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Belum Bayar / Verifikasi</span>
                                        </div>
                                        <span className="font-black text-lg text-rose-400">{stats?.transaksi_tunggakan || 0} <span className="text-xs text-slate-500 font-semibold ml-1">TRX</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80">
                                <button
                                    onClick={() => router.push(`/manager/laporan`)}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                                    Lihat Detail Laporan
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- TABLE SECTION --- */}
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden print:shadow-none print:border-none">

                        {/* Toolbar Table */}
                        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white">
                            <div>
                                <h3 className="font-extrabold text-xl text-slate-900">Riwayat Transaksi</h3>
                                <p className="text-slate-500 text-sm mt-1">Monitor aktivitas pembayaran tagihan terkini.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari nama / ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white w-full sm:w-64 transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white appearance-none cursor-pointer transition-all hover:bg-slate-100"
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
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Pelanggan</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Periode</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Pemakaian</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Total Tagihan</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-slate-100 p-5 rounded-full mb-4">
                                                        <Search size={28} className="text-slate-400" />
                                                    </div>
                                                    <h4 className="text-slate-900 font-extrabold text-lg">Tidak ada data ditemukan</h4>
                                                    <p className="text-slate-500 text-sm mt-1">Coba gunakan kata kunci pencarian yang berbeda atau pastikan ada data dari server.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100">
                                                            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.user?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-slate-400 font-medium mt-0.5">ID: {item.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700">{item.bulan} {item.tahun}</span>
                                                        <span className="text-xs text-slate-400 font-medium">{item.user?.email || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                                                        {(item.meter_akhir || 0) - (item.meter_awal || 0)} m³
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-extrabold text-slate-800 text-base">{formatRp(item.total_bayar)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.status_bayar === 'LUNAS' && (
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> LUNAS
                                                        </span>
                                                    )}
                                                    {item.status_bayar === 'MENUNGGU_VERIFIKASI' && (
                                                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> VERIFIKASI
                                                        </span>
                                                    )}
                                                    {item.status_bayar === 'BELUM_BAYAR' && (
                                                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> PENDING
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-xl hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 font-semibold text-sm flex items-center gap-1"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <span className="text-sm font-medium text-slate-500">
                                Hal <span className="text-slate-900 font-bold mx-1">{currentPage}</span> dari {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-xl hover:bg-slate-100 border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-slate-600 font-semibold text-sm flex items-center gap-1"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}