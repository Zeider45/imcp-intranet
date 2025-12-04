import { Home, BookOpen, FileText, GraduationCap, Briefcase, MessageSquare, Shield } from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export function Sidebar({ activeModule, setActiveModule, isAdmin, setIsAdmin }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'biblioteca', label: 'Biblioteca de Documentos', icon: BookOpen },
    { id: 'politicas', label: 'Políticas', icon: FileText },
    { id: 'capacitaciones', label: 'Capacitaciones', icon: GraduationCap },
    { id: 'vacantes', label: 'Vacantes Internas', icon: Briefcase },
    { id: 'foro', label: 'Foro', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">Intranet Bancaria</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeModule === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isAdmin
              ? 'bg-purple-50 text-purple-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>{isAdmin ? 'Modo Admin' : 'Modo Usuario'}</span>
        </button>
      </div>
    </aside>
  );
}
