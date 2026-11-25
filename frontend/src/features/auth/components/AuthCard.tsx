import type { ReactNode } from "react";

interface AuthCardProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  pie: ReactNode;
}

function AuthCard({ titulo, subtitulo, children, pie }: AuthCardProps) {
  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-4xl" aria-hidden="true">
            🍔
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-stone-900">{titulo}</h1>
          <p className="mt-1 text-sm text-stone-500">{subtitulo}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-stone-600">{pie}</div>
      </div>
    </main>
  );
}

export default AuthCard;
