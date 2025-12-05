import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BibliotecaDocumentos } from './components/BibliotecaDocumentos';
import { Politicas } from './components/Politicas';
import { Capacitaciones } from './components/Capacitaciones';
import { VacantesInternas } from './components/VacantesInternas';
import { Foro } from './components/Foro';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(true);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'biblioteca':
        return <BibliotecaDocumentos isAdmin={isAdmin} />;
      case 'politicas':
        return <Politicas isAdmin={isAdmin} />;
      case 'capacitaciones':
        return <Capacitaciones isAdmin={isAdmin} />;
      case 'vacantes':
        return <VacantesInternas isAdmin={isAdmin} />;
      case 'foro':
        return <Foro isAdmin={isAdmin} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
      <main className="flex-1 overflow-y-auto">
        {renderModule()}
      </main>
    </div>
  );
}
