"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";

export default function UserGreeting() {
  const { user, isLoading } = useAuth();

  const name = user?.first_name ? `${user.first_name}` : "Usuario";

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        {isLoading ? "Cargando..." : `Bienvenido de nuevo, ${name}`}
      </h1>
      <p className="text-muted-foreground mt-1">
        Aquí está un resumen de tu actividad hoy
      </p>
    </div>
  );
}
