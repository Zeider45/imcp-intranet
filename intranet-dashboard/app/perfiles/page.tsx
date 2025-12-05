import { PageHeader } from "@/components/common/page-header";
import { ProfileCard } from "@/components/modules/profiles/profile-card";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

const profiles = [
  {
    id: 1,
    name: "Juan Pérez",
    role: "Director General",
    department: "Administración",
    email: "juan.perez@imcp.com",
    phone: "+52 55 1234 5670",
    avatar: "JP",
    status: "online" as const,
  },
  {
    id: 2,
    name: "María García",
    role: "Gerente de RRHH",
    department: "Recursos Humanos",
    email: "maria.garcia@imcp.com",
    phone: "+52 55 1234 5678",
    avatar: "MG",
    status: "online" as const,
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    role: "CTO",
    department: "Tecnología",
    email: "carlos.mendoza@imcp.com",
    phone: "+52 55 1234 5679",
    avatar: "CM",
    status: "away" as const,
  },
  {
    id: 4,
    name: "Ana López",
    role: "Directora Financiera",
    department: "Finanzas",
    email: "ana.lopez@imcp.com",
    phone: "+52 55 1234 5680",
    avatar: "AL",
    status: "offline" as const,
  },
  {
    id: 5,
    name: "Roberto Sánchez",
    role: "Gerente de Marketing",
    department: "Marketing",
    email: "roberto.sanchez@imcp.com",
    phone: "+52 55 1234 5681",
    avatar: "RS",
    status: "online" as const,
  },
  {
    id: 6,
    name: "Laura Ramírez",
    role: "Gerente de Operaciones",
    department: "Operaciones",
    email: "laura.ramirez@imcp.com",
    phone: "+52 55 1234 5682",
    avatar: "LR",
    status: "online" as const,
  },
];

export default function PerfilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfiles"
        description="Directorio de colaboradores de IMCP"
        action={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Agregar Perfil
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
