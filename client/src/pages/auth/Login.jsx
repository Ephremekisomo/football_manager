import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, Lock, Mail, Loader2, Trophy, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result && result.success) {
      // On redirige vers la route centralisée /dashboard définie dans App.jsx
      // L'option { replace: true } évite que l'utilisateur ne revienne sur le login via le bouton "Précédent"
      toast.success("Heureux de vous revoir !");
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Section Gauche : Image Stade & Joueur */}
      <div className="hidden md:flex w-1/2 relative items-end justify-start p-10 lg:p-20">
        <div className="absolute inset-0 bg-emerald-950/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-transparent z-20" />
        
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
          alt="Joueur Congolais et Stade"
          className="absolute inset-0 w-full h-full object-cover object-left"
        />
        
        <div className="relative z-30 p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl max-w-lg animate-in fade-in slide-in-from-left duration-1000">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Léopards de la RDC</h2>
          <p className="text-emerald-400 font-medium mt-2">La passion du football, l'excellence de la gestion.</p>
        </div>
      </div>

      {/* Section Droite : Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-end p-8 md:p-16 lg:pr-32 bg-slate-950 z-10">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right duration-1000">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-emerald-500 font-bold text-2xl mb-8 hover:text-emerald-400 transition-colors group">
              <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span>Football Manager</span>
            </Link>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Connexion</h1>
            <p className="text-slate-400 mt-2">Gérez le football national avec fierté et rigueur.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-10">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-200 text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email ou Username</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                  placeholder="admin@football.com"
                  {...register('email', { required: 'Ce champ est requis' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs ml-1 italic">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Ce champ est requis' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs ml-1 italic">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 border border-emerald-500 text-emerald-500 font-bold rounded-xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all disabled:opacity-50 text-lg"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            </button>

            <div className="pt-4 text-center">
              <p className="text-slate-500 text-sm">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
