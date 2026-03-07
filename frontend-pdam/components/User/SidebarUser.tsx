"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    LogOut,
    X,
    Droplets
} from "lucide-react"

interface SidebarProps {
    isOpen: boolean;          // Status: buka/tutup
    onClose: () => void;      // Fungsi tutup sidebar
    onLogout: () => void;     // Fungsi logout
}

export default function SidebarUser({ isOpen, onClose, onLogout }: SidebarProps) {
    const pathname = usePathname()

    const menus = [
        { label: "Dashboard", href: "/user/dashboard", icon: <LayoutDashboard size={20} /> },
        { label: "Pengaduan", href: "/user/pengaduan", icon: <MessageSquare size={20} /> },
        // Tambah menu lain di sini jika perlu
    ]

    return (
        <>
            {/* 1. OVERLAY / BACKDROP (Hanya di Mobile) */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
                `}
                onClick={onClose}
            ></div>

            {/* 2. SIDEBAR PANEL (Floating Card di Mobile, Fixed Full di Desktop) */}
            <aside
                className={`fixed z-50 bg-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    /* MOBILE STYLE (FLOATING CARD) */
                    top-4 bottom-4 left-4 w-[calc(100%-2rem)] max-w-70 rounded-4xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]
                    ${isOpen ? "translate-x-0 scale-100 opacity-100" : "-translate-x-[120%] scale-95 opacity-0"}
                    /* DESKTOP STYLE (PERSISTENT & FIXED LEFT) */
                    lg:top-0 lg:bottom-0 lg:left-0 lg:w-72 lg:rounded-none lg:m-0 lg:h-full lg:shadow-none lg:border-r lg:border-slate-100/80 lg:translate-x-0 lg:scale-100 lg:opacity-100
                `}
            >
                {/* HEADER: Logo & Tombol Close */}
                <div className="p-6 lg:p-8 border-b border-slate-100/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo yang diselaraskan dengan warna Banner Hero (#0A0F2C) */}
                        <div className="w-11 h-11 bg-[#0A0F2C] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-transparent"></div>
                            <Droplets size={22} className="text-blue-400 relative z-10" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 text-lg leading-none tracking-tight">PDAM Pintar</h1>
                            <span className="text-[10px] text-blue-600 font-black tracking-widest uppercase mt-0.5 block">Pelanggan</span>
                        </div>
                    </div>

                    {/* Tombol Close (Hanya muncul di Mobile) */}
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors lg:hidden bg-slate-50/80"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* MENU LIST */}
                <div className="flex-1 overflow-y-auto p-5 space-y-1.5 scrollbar-hide">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-2">
                        Menu Navigasi
                    </p>

                    {menus.map((menu, index) => {
                        const isActive = pathname === menu.href
                        return (
                            <Link
                                key={index}
                                href={menu.href}
                                onClick={() => {
                                    // Tutup otomatis saat menu diklik (Hanya di layar Mobile)
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group
                                    ${isActive
                                        ? "bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]"
                                        : "text-slate-500 hover:bg-blue-50/50 hover:text-blue-700"
                                    }
                                `}
                            >
                                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"} transition-all duration-300`}>
                                    {menu.icon}
                                </span>
                                {menu.label}
                            </Link>
                        )
                    })}
                </div>

                {/* FOOTER: Logout */}
                <div className="p-5 border-t border-slate-100/60 bg-slate-50/30 rounded-b-4xl lg:rounded-none">
                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 text-slate-600 px-4 py-3.5 rounded-2xl text-sm font-black transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] group"
                    >
                        <LogOut size={18} className="text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-1 transition-all" />
                        Keluar Aplikasi
                    </button>
                </div>
            </aside>
        </>
    )
}