import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { authAPI } from '@/api';
import { LogIn, Mail, Lock, Trophy, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      setAuth(response.data.user, response.data.token, response.data.club);
      toast.success(`Bienvenue, ${response.data.user.nom}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Section Gauche : Image Joueur Congolais & Stade */}
      <div className="hidden md:block w-1/2 relative">
        <div className="absolute inset-0 bg-emerald-900/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-transparent z-20" />
        
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
          alt="Stade de Football et Joueur"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute bottom-20 left-12 right-12 z-30 p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-2xl">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Fierté Nationale</h2>
          <p className="text-emerald-400 font-medium mt-2">La passion du football, la rigueur de la gestion.</p>
        </div>
      </div>

      {/* Section Droite : Formulaire de connexion */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 z-10 bg-slate-950">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right duration-700">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-500 font-bold text-2xl mb-8 hover:text-emerald-400 transition-colors group">
              <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              Football Manager
            </Link>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Connexion</h1>
            <p className="text-slate-400 mt-2">Accédez à la gestion du football national.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email ou Identifiant</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="admin@football.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 border border-emerald-500 text-emerald-500 font-bold rounded-xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}