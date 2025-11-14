import Link from 'next/link';

interface ModulePageProps {
  title: string;
  description: string;
  emoji: string;
  features: string[];
  apiEndpoint: string;
}

export default function ModulePage({
  title,
  description,
  emoji,
  features,
  apiEndpoint,
}: ModulePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
        >
          <span>←</span>
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">{emoji}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                {description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ✨ Características
            </h2>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-blue-500 mt-1">▸</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* API Endpoint */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              API Endpoint
            </h3>
            <code className="block p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200">
              {apiEndpoint}
            </code>
          </div>

          {/* Status */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Módulo Disponible
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  API REST completamente funcional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Nota:</strong> Este módulo está completamente implementado
            en el backend. La interfaz de usuario está en desarrollo.
          </p>
        </div>
      </div>
    </div>
  );
}
