import { Outlet } from 'react-router-dom';
import { Footprints } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fond avec motif subtil */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>
      
      <div className="relative z-10"><Outlet /></div>
    </div>
  );
}