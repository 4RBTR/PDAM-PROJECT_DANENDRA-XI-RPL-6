"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
    LayoutDashboard, 
    CheckCircle, 
    Users, 
    LogOut, 
    Droplets,
    X
} from "lucide-react"

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function SidebarKasir({ isOpen, onClose, onLogout }: SidebarProps) {
    const pathname = usePathname()

    const menus = [
        { label: "Input Tagihan", href: "/kasir/dashboard", icon: <Droplets size={20} /> },
        { label: "Verifikasi Bayar", href: "/kasir/verifikasi", icon: <CheckCircle size={20} /> },
        { label: "Kelola Pelanggan", href: "/kasir/pelanggan", icon: <Users size={20} /> },
    ]

    return (
        <>
            {/* 1. OVERLAY (Hanya muncul di Mobile) */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden
                    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
                `}
                onClick={onClose}
            ></div>

            {/* 2. SIDEBAR PANEL */}
            <aside
                className={`fixed top-0 left-0 w-72 h-full bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    lg:translate-x-0 
                `}
            >
                {/* HEADER */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                            P
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 text-lg leading-none tracking-tight">PDAM Pintar</h1>
                            <span className="text-[10px] text-blue-500 font-black tracking-widest uppercase">Kasir Panel</span>
                        </div>
                    </div>

                    {/* Tombol Close (Hanya muncul di Mobile) */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* MENU LIST */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mt-2">Menu Utama</p>
                    {menus.map((menu, index) => {
                        const isActive = pathname === menu.href
                        return (
                            <Link
                                key={index}
                                href={menu.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold text-sm
                                    ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }
                                `}
                            >
                                {menu.icon}
                                {menu.label}
                            </Link>
                        )
                    })}
                </div>

                {/* FOOTER: Logout */}
                <div className="p-4 border-t border-slate-50">
                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 px-4 py-3.5 rounded-2xl text-sm font-black transition-all group"
                    >
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        Keluar Aplikasi
                    </button>
                </div>
            </aside>
        </>
    )
}