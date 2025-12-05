import { Users, FileText, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { StatsCard } from './dashboard/StatsCard';
import { RecentActivity } from './dashboard/RecentActivity';
import { UpcomingEvents } from './dashboard/UpcomingEvents';
import { QuickActions } from './dashboard/QuickActions';
import { ForumPosts } from './dashboard/ForumPosts';

export function Dashboard() {
  const stats = [
    { label: 'Empleados', value: '1,247', icon: Users, color: 'blue' },
    { label: 'Documentos Compartidos', value: '856', icon: FileText, color: 'green' },
    { label: 'Eventos Próximos', value: '12', icon: Calendar, color: 'purple' },
    { label: 'Cursos Completados', value: '342', icon: BookOpen, color: 'orange' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Bienvenido a la Intranet</h1>
        <p className="text-gray-600">Panel de control principal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <ForumPosts />
        </div>
      </div>
    </div>
  );
}
