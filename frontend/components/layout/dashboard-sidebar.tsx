"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { FileText, GraduationCap, Home, ChevronRight, Library, ScrollText, Briefcase, CalendarDays, MessageSquare } from 'lucide-react';
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
    title: "Documentación",
    items: [
      { title: "Biblioteca de Documentos", href: "/library-documents", icon: Library },
    ],
  },
  {
    title: "Políticas y Normativas",
    items: [
      { title: "Políticas", href: "/policies", icon: ScrollText },
    ],
  },
  {
    title: "Capacitación",
    items: [
      { title: "Planes de Capacitación", href: "/training-plans", icon: GraduationCap },
      { title: "Sesiones de Capacitación", href: "/training-sessions", icon: CalendarDays },
    ],
  },
  {
    title: "Recursos Humanos",
    items: [
      { title: "Vacantes Internas", href: "/internal-vacancies", icon: Briefcase },
    ],
  },
  {
    title: "Comunidad",
    items: [
      { title: "Foro de Discusión", href: "/forum", icon: MessageSquare },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-6 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-blue-600">Intranet IMCP</h1>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-center text-blue-600 hover:text-blue-700"
            aria-label="Expandir menú"
          >
            <ChevronRight className="h-5 w-5 mx-auto" />
          </button>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-6 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Colapsar menú"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.flatMap((group) => group.items).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
            JP
          </div>
          {!collapsed && (
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-900">Juan Pérez</p>
              <p className="text-xs text-gray-600">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
