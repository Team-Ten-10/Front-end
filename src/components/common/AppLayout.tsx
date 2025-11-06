import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black/85 flex justify-center">
      <div className="w-full max-w-xl bg-white min-h-screen border-x border-gray-300">
        {children}
      </div>
    </div>
  );
}
