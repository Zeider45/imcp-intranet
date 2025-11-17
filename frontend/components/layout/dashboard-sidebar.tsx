"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Building2, Users, Megaphone, FileText, Calendar, Plane, Wrench, GraduationCap, Lightbulb, MessageSquare, MessageCircle, BarChart3, Link2, FolderKanban, CheckSquare, Home, ChevronRight } from 'lucide-react';
import { useState } from "react";
import type { NavGroup } from "@/types/navigation";

const navigation: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { title: "Inicio", href: "/", icon: Home },
    ],
  },
  {
    title: "Módulos Principales",
    items: [
      { title: "Departamentos", href: "/departamentos", icon: Building2 },
      { title: "Perfiles", href: "/perfiles", icon: Users },
      { title: "Anuncios", href: "/anuncios", icon: Megaphone, badge: 3 },
      { title: "Documentos", href: "/documentos", icon: FileText },
    ],
  },
  {
    title: "Gestión del Tiempo",
    items: [
      { title: "Calendario", href: "/calendario", icon: Calendar },
      { title: "Solicitudes", href: "/solicitudes", icon: Plane },
      { title: "Recursos", href: "/recursos", icon: Wrench },
    ],
  },
  {
    title: "Formación",
    items: [
      { title: "Cursos", href: "/cursos", icon: GraduationCap },
      { title: "Conocimiento", href: "/conocimiento", icon: Lightbulb },
    ],
  },
  {
    title: "Colaboración",
    items: [
      { title: "Foros", href: "/foros", icon: MessageSquare },
      { title: "Sugerencias", href: "/sugerencias", icon: MessageCircle },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { title: "KPIs", href: "/kpis", icon: BarChart3 },
      { title: "Enlaces", href: "/enlaces", icon: Link2 },
      { title: "Proyectos", href: "/proyectos", icon: FolderKanban },
      { title: "Tareas", href: "/tareas", icon: CheckSquare, badge: 5 },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              IM
            </div>
            <span className="font-semibold text-sidebar-foreground">IMCP</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-sidebar-accent text-sidebar-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              !collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 text-sm">
              <p className="font-medium text-sidebar-foreground">Juan Pérez</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
