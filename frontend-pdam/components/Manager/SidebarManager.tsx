// components/SidebarUser.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
    isOpen: boolean;          // Status: buka/tutup
    onClose: () => void;      // Fungsi tutup sidebar
    onLogout: () => void;     // Fungsi logout
}

export default function SidebarUser({ isOpen, onClose, onLogout }: SidebarProps) {
    const pathname = usePathname()

    // Menu disesuaikan dengan fitur Manager
    const menus = [
        { label: "Dashboard", href: "/manager/dashboard", icon: "🏠" },
        { label: "Massager", href: "/manager/pengaduan", icon: "✅" },
    ]

    return (
        <>
            {/* 1. OVERLAY / BACKDROP
          Layar hitam transparan di belakang sidebar.
          Muncul jika isOpen = true. Klik disini = tutup sidebar.
      */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
        `}
                onClick={onClose}
            ></div>

            {/* 2. SIDEBAR PANEL
          Fixed di kiri. Default: -translate-x-full (sembunyi ke kiri).
          Jika isOpen: translate-x-0 (muncul).
          Berlaku untuk Mobile & Laptop (sesuai request).
      */}
            <aside
                className={`fixed top-0 left-0 w-72 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* HEADER: Logo & Tombol Close */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                            P
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-none">PDAM Pintar</h1>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Manager</span>
                        </div>
                    </div>

                    {/* Tombol Close (X) */}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* MENU LIST */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Navigasi</p>
                    {menus.map((menu, index) => {
                        const isActive = pathname === menu.href
                        return (
                            <Link
                                key={index}
                                href={menu.href}
                                onClick={onClose} // Tutup sidebar otomatis saat link diklik
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm
                   ${isActive
                                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                    }
                 `}
                            >
                                <span className="text-xl">{menu.icon}</span>
                                {menu.label}
                            </Link>
                        )
                    })}
                </div>

                {/* FOOTER: Logout */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => { onClose(); onLogout(); }}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-600 px-4 py-3 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                        <span>🚪</span> Keluar Aplikasi
                    </button>
                </div>
            </aside>
        </>
    )
}