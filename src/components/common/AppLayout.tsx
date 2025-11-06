import type { ReactNode } from "react";
import logo from "../../../public/Avatar 48x48.png";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black/85 flex justify-center">
      <div className="w-full max-w-xl bg-white h-screen border-x border-gray-300 flex flex-col overflow-hidden">
        <div className="flex items-center p-2 gap-2 border-b flex-shrink-0">
          <img src={logo} alt="logo" className="w-8" />
          <p className="font-bold">Easy Way</p>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
