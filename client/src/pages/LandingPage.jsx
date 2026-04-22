import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Calendar,
  Trophy,
  BarChart2,
  Users,
  LogIn,
  List,
  Award,
  Clock,
  Home,
} from 'lucide-react';
import api from '@/api';

export default function LandingPage() {
  const [latestMatches, setLatestMatches] = useState([]);
  const [topClubs, setTopClubs] = useState([]);
  const [classement, setClassement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          matchesRes,
          clubsRes,
          classementRes,
        ] = await Promise.all([
          api.get('/matchs', { params: { limit: 3, statut: 'termine', sort: '-date_match,-heure_match' } }),
          api.get('/clubs', { params: { limit: 3 } }),
          api.get('/classements', { params: { competition_id: 1, saison: '2024-2025' } }),
        ]);

        setLatestMatches(matchesRes.data.data.matchs || []);
        setTopClubs(clubsRes.data.data.clubs || []);
        setClassement(classementRes.data.data || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-6 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors group">
            <Trophy className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            Football Manager
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-all">
                  <Home className="w-4 h-4" /> Accueil
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-all">
                  <LogIn className="w-4 h-4" /> Connexion
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-6">
        {/* Section Présentation */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Gérez le Football National <br />
            <span className="text-emerald-500 bg-emerald-500/10 px-4 rounded-lg">avec Facilité</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Plateforme de gestion du football national permettant l'organisation des compétitions, le suivi des clubs, des joueurs, des matchs et des classements en temps réel.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="px-8 py-4 bg-slate-900 border border-emerald-500 text-emerald-500 font-bold rounded-xl shadow-xl shadow-emerald-900/20 hover:bg-emerald-600 hover:text-white hover:-translate-y-1 transition-all text-lg flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" /> Se connecter
            </Link>
            <Link to="/login" className="px-8 py-4 border-2 border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-lg flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" /> Voir les compétitions
            </Link>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Fonctionnalités Clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Shield} title="Gestion des Clubs" description="Enregistrez et gérez toutes les informations de vos clubs." />
            <FeatureCard icon={Calendar} title="Gestion des Matchs" description="Planifiez, suivez et mettez à jour les matchs en toute simplicité." />
            <FeatureCard icon={BarChart2} title="Classement Automatique" description="Obtenez des classements mis à jour en temps réel." />
            <FeatureCard icon={Users} title="Statistiques Détaillées" description="Accédez à des statistiques complètes sur les joueurs." />
          </div>
        </section>

        {/* Section Aperçu Données */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">Données en Temps Réel</h2>
          {loading ? (
            <div className="text-center py-20 animate-pulse text-slate-500 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              Chargement des données...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Derniers Matchs */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 group">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                  <Clock className="w-6 h-6 text-emerald-500" /> Derniers Matchs
                </h3>
                <ul className="space-y-3">
                  {latestMatches.map((match) => (
                    <li key={match.id} className="p-4 bg-slate-800/40 rounded-xl flex justify-between items-center border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="text-sm">
                        <p className="font-bold text-slate-100">{match.club_domicile_nom} - {match.club_exterieur_nom}</p>
                        <p className="text-slate-500 mt-1">{new Date(match.date_match).toLocaleDateString()}</p>
                      </div>
                      <span className="font-black text-xl text-emerald-500">{match.buts_domicile} - {match.buts_exterieur}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Classement */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 group">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                  <List className="w-6 h-6 text-emerald-500" /> Classement
                </h3>
                <ul className="space-y-2">
                  {classement.slice(0, 5).map((club, index) => (
                    <li key={club.club_id} className="flex justify-between items-center p-3.5 bg-slate-800/40 rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors">
                      <span className="font-bold w-6 text-slate-400">{index + 1}.</span>
                      <span className="flex-1 font-medium text-slate-100">{club.equipe}</span>
                      <span className="font-bold text-emerald-400">{club.points} pts</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clubs */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 group">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                  <Shield className="w-6 h-6 text-emerald-500" /> Clubs
                </h3>
                <ul className="space-y-3">
                  {topClubs.map((club) => (
                    <li key={club.id} className="p-4 bg-slate-800/40 rounded-xl text-sm border border-slate-700 hover:border-slate-600 transition-colors">
                      <p className="font-bold text-slate-100">{club.nom_club}</p>
                      <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider">{club.ville}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 text-slate-500 py-16 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 text-xl font-bold text-emerald-500 mb-6">
            <Trophy className="w-6 h-6" /> Football Manager
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Football Management System. <br className="sm:hidden" /> Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-slate-900/50 rounded-2xl p-8 text-center border border-slate-800 hover:border-emerald-500/40 hover:-translate-y-2 transition-all duration-300 group shadow-lg">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
          <Icon className="w-8 h-8" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{description}</p>
    </div>
  );
}