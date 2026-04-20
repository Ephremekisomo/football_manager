import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BarChart3, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { competitionAPI } from '@/api';
import { useAuthStore } from '@/store';
import api from '@/api';

export default function ClassementsList() {
  const [standings, setStandings] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [saisons, setSaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const competitionId = searchParams.get('competition_id');
  // On récupère la saison de la compétition sélectionnée si elle existe dans notre liste
  const selectedComp = competitions.find(c => c.id == competitionId);
  const saison = searchParams.get('saison') || selectedComp?.saison || '2024-2025';

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const response = await competitionAPI.getAll({});
      // Extraction correcte : l'API renvoie { competitions: [], pagination: {} }
      const comps = response.data.data.competitions || (Array.isArray(response.data.data) ? response.data.data : []);
      // Trier: actives en premier, puis clôturées
      const sorted = comps.sort((a, b) => {
        const statutA = a.statut === 'active' ? 0 : 1;
        const statutB = b.statut === 'active' ? 0 : 1;
        return statutA - statutB;
      });
      setCompetitions(sorted);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStandings = async () => {
    if (!competitionId) return;
    setLoading(true);
    try {
      const response = await api.get('/classements', { 
        params: { competition_id: competitionId, saison } 
      });
      setStandings(response.data.data);
      if (response.data.saisons) {
        setSaisons(response.data.saisons);
      }
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [competitionId, saison]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Si on change de compétition, on garde la saison actuelle ou on remet par défaut
    if (key === 'competition_id' && !value) {
      setSearchParams({});
    } else {
      setSearchParams(newParams);
    }
  };

  const stats = {
    meilleureAttaque: standings.length > 0 ? standings.reduce((max, row) => row.buts_pour > max.buts_pour ? row : max, standings[0]) : null,
    meilleureDefense: standings.length > 0 ? standings.reduce((min, row) => row.buts_contre < min.buts_contre ? row : min, standings[0]) : null,
  };

  if (!competitionId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Championnats & Coupes</h1>
            <p className="text-slate-500">Sélectionnez une compétition pour voir le classement</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Chargement des compétitions...</div>
        ) : competitions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Aucune compétition disponible pour le moment.</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map(comp => (
            <button 
              key={comp.id}
              onClick={() => navigate(`?competition_id=${comp.id}&saison=${comp.saison || saison}`)}
              className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${comp.statut === 'active' ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Award className="w-6 h-6" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  comp.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {comp.statut === 'active' ? 'En cours' : 'Clôturée'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{comp.nom_competition || comp.nom}</h3>
              <p className="text-sm text-slate-500">{comp.type_competition} • {comp.saison}</p>
              <div className="mt-4 text-primary-600 text-sm font-semibold flex items-center gap-1">
                Voir le classement →
              </div>
            </button>
          ))}
        </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSearchParams({})} 
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {competitions.find(c => c.id == competitionId)?.nom_competition || 'Classement'}
          </h1>
          <p className="text-slate-500">Saison {saison}</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-slate-900">Meilleure attaque</h3>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.meilleureAttaque?.buts_pour || 0} buts</p>
          <p className="text-sm text-green-800">{stats.meilleureAttaque?.equipe}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Meilleure défense</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.meilleureDefense?.buts_contre || 0} buts</p>
          <p className="text-sm text-blue-800">{stats.meilleureDefense?.equipe}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Équipe leader</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">{standings[0]?.points || 0} pts</p>
          <p className="text-sm text-purple-800">{standings[0]?.equipe}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={competitionId}
            onChange={(e) => handleFilterChange('competition_id', e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Toutes compétitions</option>
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.nom_competition || comp.nom}</option>
            ))}
          </select>
          <select
            value={saison}
            onChange={(e) => handleFilterChange('saison', e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {saisons.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau classement */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Équipe</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">MJ</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">V</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">N</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">D</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">BP</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">BC</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">DB</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Forme</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-500">Chargement du classement...</td></tr>
              ) : standings.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-500">Aucun club n'a encore de match validé.</td></tr>
              ) : (
                standings
                  .filter(row => row.equipe.toLowerCase().includes(search.toLowerCase()))
                  .map((row) => (
                  <tr key={row.equipe} className={`hover:bg-slate-50 ${row.color}`}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.position}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-primary-600" />
                        </div>
                        <Link 
                          to={`/classements/${row.equipe}?competition_id=${competitionId}&saison=${saison}`} 
                          className="font-medium text-slate-900 hover:text-primary-600"
                        >
                          {row.equipe}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-700">{row.matchs_joues}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-green-600">{row.victoires}</td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">{row.nuls}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-red-600">{row.defaites}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-blue-600">{row.buts_pour}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-orange-600">{row.buts_contre}</td>
                    <td className={`px-4 py-4 text-center text-sm font-semibold ${row.diff_buts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.diff_buts >= 0 ? `+${row.diff_buts}` : row.diff_buts}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(row.forme || '').split('').map((r, i) => (
                          <span 
                            key={i} 
                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold text-white ${
                              r === 'V' ? 'bg-green-500' : 
                              r === 'N' ? 'bg-slate-400' : 
                              'bg-red-500'
                            }`}
                            title={r === 'V' ? 'Victoire' : r === 'N' ? 'Nul' : 'Défaite'}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">{row.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
