'use client'
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Main from "@/components/Main";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Usuario } from "@/app/(main)/usuarios/model/usuario.interfaces";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("layover_user");
      if (stored) {
        const parsed: Usuario = JSON.parse(stored);
        setUsuario(parsed);
      }
    } catch (err) {
      console.error("Error leyendo localStorage:", err);
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full relative">

        {/* === BOTÓN TOGGLE === */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Ocultar menú" : "Abrir menú"}
          className={`fixed top-4 z-40 transition-all duration-300
            ${sidebarOpen ? 'left-[304px]' : 'left-4'}
            bg-[var(--layover-from)] hover:bg-[var(--layover-to)] 
            text-black px-2 py-1 rounded-md text-sm shadow-sm`}
        >
          {sidebarOpen ? '←' : '☰'}
        </button>

        {/* === SIDEBAR === */}
        {sidebarOpen && (
          <div className="shrink-0 w-[288px] transition-all duration-300">
            <AppSidebar />
          </div>
        )}

        {/* === CONTENIDO + TOPBAR === */}
        <div className="flex-1 flex flex-col transition-all duration-300">
          <div className="flex justify-end p-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold hidden sm:inline">
                {usuario ? usuario.nombre : "..."}
              </span>
              <div className="w-8 h-8 rounded-full bg-lime-300 grid place-items-center overflow-hidden">
                {usuario ? (
                  <Image
                    src={usuario.fotoUrl || "/userDefault.png"}
                    alt={usuario.nombre}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <Main>{children}</Main>
        </div>
      </div>
    </SidebarProvider>
  );
}