'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import { getWelcome, checkHealth, WelcomeResponse, HealthCheckResponse } from '@/lib/api';

export default function Home() {
  const [welcomeData, setWelcomeData] = useState<WelcomeResponse | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from Django backend
        const [welcomeResult, healthResult] = await Promise.all([
          getWelcome(),
          checkHealth()
        ]);

        if (welcomeResult.error || healthResult.error) {
          setError(welcomeResult.error || healthResult.error || 'Failed to fetch data');
        } else {
          setWelcomeData(welcomeResult.data || null);
          setHealthData(healthResult.data || null);
        }
      } catch {
        setError('Error connecting to backend');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8 gap-8">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-4">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>+</span>
            <span className="font-semibold">Django REST API</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Conectando con el backend...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-red-500 text-5xl">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error de Conexión</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                Asegúrate de que el servidor Django esté ejecutándose en http://localhost:8000
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Welcome Message */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {welcomeData?.message || 'Intranet IMCP'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  {welcomeData?.description}
                </p>
                <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  Versión {welcomeData?.version}
                </span>
              </div>

              {/* Status Cards */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">✅</div>
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">Frontend</h3>
                      <p className="text-sm text-green-600 dark:text-green-300">Next.js funcionando</p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-6 border ${
                  healthData?.status === 'ok' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{healthData?.status === 'ok' ? '✅' : '⚠️'}</div>
                    <div>
                      <h3 className={`font-semibold ${
                        healthData?.status === 'ok'
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        Backend
                      </h3>
                      <p className={`text-sm ${
                        healthData?.status === 'ok'
                          ? 'text-green-600 dark:text-green-300'
                          : 'text-yellow-600 dark:text-yellow-300'
                      }`}>
                        {healthData?.message || 'Django API'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  🎯 Características
                </h2>
                <ul className="grid md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">▸</span>
                    <span>Frontend: Next.js 16 + TypeScript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">▸</span>
                    <span>Backend: Django 5.2 + DRF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">▸</span>
                    <span>Estilos: Tailwind CSS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">▸</span>
                    <span>CORS configurado</span>
                  </li>
                </ul>
              </div>

              {/* Quick Links to Modules */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📚 Módulos Disponibles
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <a
                    href="/departments"
                    className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <span className="text-2xl">🏢</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Departamentos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estructura organizacional</p>
                    </div>
                  </a>
                  <a
                    href="/profiles"
                    className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Perfiles</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Directorio de empleados</p>
                    </div>
                  </a>
                  <a
                    href="/announcements"
                    className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <span className="text-2xl">📢</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Anuncios</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comunicados importantes</p>
                    </div>
                  </a>
                  <a
                    href="/documents"
                    className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Documentos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Repositorio de archivos</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Sistema de Intranet • IMCP</p>
        </div>
      </main>
    </div>
  );
}

