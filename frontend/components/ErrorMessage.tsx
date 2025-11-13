import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = 'Error', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-red-500 text-5xl">⚠️</div>
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
