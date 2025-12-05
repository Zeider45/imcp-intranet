import { DepartmentCard } from "@/components/modules/departments/department-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const departments = [
  {
    id: 1,
    name: "Recursos Humanos",
    manager: "María García",
    employees: 12,
    email: "rh@imcp.com",
    phone: "+52 55 1234 5678",
    description: "Gestión de talento y desarrollo organizacional",
  },
  {
    id: 2,
    name: "Tecnología",
    manager: "Carlos Mendoza",
    employees: 24,
    email: "ti@imcp.com",
    phone: "+52 55 1234 5679",
    description: "Infraestructura y desarrollo de sistemas",
  },
  {
    id: 3,
    name: "Finanzas",
    manager: "Ana López",
    employees: 18,
    email: "finanzas@imcp.com",
    phone: "+52 55 1234 5680",
    description: "Contabilidad y planeación financiera",
  },
  {
    id: 4,
    name: "Marketing",
    manager: "Roberto Sánchez",
    employees: 15,
    email: "marketing@imcp.com",
    phone: "+52 55 1234 5681",
    description: "Estrategia de marca y comunicación",
  },
  {
    id: 5,
    name: "Operaciones",
    manager: "Laura Ramírez",
    employees: 30,
    email: "ops@imcp.com",
    phone: "+52 55 1234 5682",
    description: "Gestión de procesos y logística",
  },
  {
    id: 6,
    name: "Legal",
    manager: "Miguel Torres",
    employees: 8,
    email: "legal@imcp.com",
    phone: "+52 55 1234 5683",
    description: "Asuntos legales y cumplimiento normativo",
  },
];

export default function DepartamentosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departamentos"
        description="Estructura organizacional de IMCP"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
      </div>
    </div>
  );
}
