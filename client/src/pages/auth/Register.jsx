import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, UserPlus, Mail, Lock, User, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { authAPI } from '../../api';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await authAPI.register(data);
      if (result.data.success) {
        toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        reset();
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-500 font-bold text-2xl mb-8 hover:text-emerald-400 transition-colors group">
            <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span>Football Manager</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Créer un compte</h1>
          <p className="text-slate-400 mt-2">Rejoignez la plateforme de gestion du football national.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-10">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-200 text-sm font-medium">{error}</span>
          </div>
        )}

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Nom d'utilisateur *</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                className={`w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${errors.username ? 'border-red-500/50' : ''}`}
                placeholder="Votre nom d'utilisateur"
                {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs ml-1 italic">{errors.username.message}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email *</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="email"
                className={`w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                placeholder="votre@email.com"
                {...register('email', { required: 'L\'email est requis', pattern: { value: /^\S+@\S+$/i, message: 'Format d\'email invalide' } })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs ml-1 italic">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe *</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-12 pr-12 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${errors.password ? 'border-red-500/50' : ''}`}
              placeholder="Minimum 8 caractères"
              {...register('password', { required: 'Le mot de passe est requis', minLength: { value: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' } })}
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
            disabled={false} // Pas de loading state pour l'instant, mais prêt à être ajouté
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 border border-emerald-500 text-emerald-500 font-bold rounded-xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all disabled:opacity-50 text-lg"
          >
            S'inscrire
            <ArrowRight className="w-5 h-5" />
            {/* {isLoading && <Loader2 className="w-5 h-5 animate-spin" />} */}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-slate-500 text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
