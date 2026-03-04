// components/manager/SidebarManager.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    Settings,
    LogOut,
    Droplets,
    ChevronRight,
    Menu, // Icon untuk tombol buka menu
    X     // Icon untuk tombol tutup menu
} from "lucide-react"

interface SidebarProps {
    managerName: string;
    onLogout: () => void;
}

export default function SidebarManager({ managerName, onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false); // State untuk buka/tutup sidebar

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
        { name: "Pengaduan", icon: MessageSquare, href: "/manager/pengaduan" },
        { name: "Laporan", icon: FileText, href: "/manager/laporan" },
        { name: "Pelanggan", icon: Settings, href: "/manager/pelanggan" },
    ];

    // Fungsi untuk menutup sidebar saat menu diklik (UX mobile)
    const handleLinkClick = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* --- MOBILE TOGGLE BUTTON (Hanya muncul di Mobile) --- */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* --- OVERLAY BACKDROP (Hanya muncul saat sidebar terbuka di Mobile) --- */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            {/* Penjelasan Class Responsive:
                1. fixed inset-y-0 left-0: Posisi fix di kiri full height untuk mobile.
                2. transform transition-transform: Animasi slide.
                3. -translate-x-full: Default tersembunyi ke kiri di mobile.
                4. lg:translate-x-0: Di desktop selalu terlihat (reset posisi).
                5. lg:static / lg:sticky: Di desktop dia sticky/static sesuai layout.
                6. isOpen ? "translate-x-0" : ... : Logika buka tutup mobile.
            */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 
                flex flex-col justify-between p-6 shadow-2xl lg:shadow-sm z-50 
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>

                {/* --- TOMBOL CLOSE (Hanya muncul di dalam sidebar Mobile) --- */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 lg:hidden"
                >
                    <X size={24} />
                </button>

                {/* --- LOGO SECTION --- */}
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2 mt-2 lg:mt-0">
                        <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                            <Droplets size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                                PDAM<span className="text-indigo-600">Pintar</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">MANAGER OPS</p>
                        </div>
                    </div>

                    {/* --- NAVIGATION MENU --- */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={handleLinkClick} // Tutup sidebar saat link diklik
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} />
                                        <span className="font-semibold text-sm">{item.name}</span>
                                    </div>
                                    {isActive && <ChevronRight size={16} className="text-indigo-600" />}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* --- LOGOUT SECTION --- */}
                <div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-100 transition-all"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    )
}