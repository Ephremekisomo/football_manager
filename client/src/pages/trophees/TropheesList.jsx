import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Award, Trophy, Calendar, Crown } from 'lucide-react';
import { competitionAPI, tropheeAPI } from '@/api';
import { useAuthStore } from '@/store';
import api from '@/api';

export default function TropheesList() {
  const [trophees, setTrophees] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  const competitionId = searchParams.get('competition_id');
  const saison = searchParams.get('saison') || '2024';
  const typeTrophee = searchParams.get('type') || '';

  const fetchCompetitions = async () => {
    try {
      const response = await competitionAPI.getAll({});
      setCompetitions(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setCompetitions([]);
    }
  };

  const fetchTrophees = async () => {
    setLoading(true);
    try {
      const params = { competition_id: competitionId, saison, type_trophee: typeTrophee };
      const response = await tropheeAPI.getAll(params);
      setTrophees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trophees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    fetchTrophees();
  }, [competitionId, saison, typeTrophee]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const stats = {
    champions: trophees.filter(t => t.type_trophee === 'championnat').length,
    individuels: trophees.filter(t => t.type_trophee === 'individuel').length,
  };

  const filteredTrophees = trophees.filter(t => 
    t.nom_trophee.toLowerCase().includes(search.toLowerCase()) ||
    t.club_gagnant_nom?.toLowerCase().includes(search.toLowerCase()) ||
    t.joueur_nom?.toLowerCase().includes(search.toLowerCase())
  );

  if (!competitionId && !typeTrophee) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">🏆 Trophées</h1>
            <p className="text-slate-500">Sélectionnez une compétition ou type pour voir les trophées</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8 text-center hover:shadow-lg transition-all">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Compétitions</h3>
            <select 
              onChange={(e) => handleFilterChange('competition_id', e.target.value)}
              className="px-6 py-3 border border-yellow-200 rounded-xl bg-white font-medium hover:shadow-md focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Toutes compétitions</option>
              {competitions.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.nom}</option>
              ))}
            </select>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 text-center hover:shadow-lg transition-all">
            <Trophy className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Types de Trophées</h3>
            <select 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-6 py-3 border border-purple-200 rounded-xl bg-white font-medium hover:shadow-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Tous types</option>
              <option value="championnat">Championnats</option>
              <option value="individuel">Individuels</option>
              <option value="coupe">Coupes</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏆 Trophées</h1>
          <p className="text-slate-500">
            {competitionId && competitions.find(c => c.id == competitionId)?.nom} - Saison {saison}
            {typeTrophee && ` • ${typeTrophee === 'championnat' ? 'Championnats' : typeTrophee === 'individuel' ? 'Individuels' : 'Autres'}`}
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-slate-900">Champions</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.champions}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Individuels</h3>
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.individuels}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Récent</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{trophees.length}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher trophée, club ou joueur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={competitionId || ''}
            onChange={(e) => handleFilterChange('competition_id', e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Toutes compétitions</option>
            {competitions.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.nom}</option>
            ))}
          </select>
          <select
            value={saison}
            onChange={(e) => handleFilterChange('saison', e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            value={typeTrophee}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tous types</option>
            <option value="championnat">Championnats</option>
            <option value="individuel">Individuels</option>
            <option value="coupe">Coupes</option>
          </select>
        </div>
      </div>

      {/* Tableau trophées */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Trophée</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Gagnant</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">Compétition</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Chargement des trophées...</td></tr>
              ) : filteredTrophees.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Aucun trophée trouvé</td></tr>
              ) : (
                filteredTrophees.map((trophee) => (
                  <tr key={trophee.id || trophee.nom_trophee} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{trophee.nom_trophee}</div>
                      <div className="text-sm text-slate-500">{trophee.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trophee.type_trophee === 'championnat' ? 'bg-yellow-100 text-yellow-800' :
                        trophee.type_trophee === 'individuel' ? 'bg-purple-100 text-purple-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {trophee.type_trophee}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {trophee.club_gagnant_nom || trophee.joueur_nom || 'À déterminer'}
                      </div>
                      {trophee.buts && <div className="text-sm text-emerald-600 font-medium">({trophee.buts} buts)</div>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{trophee.competition_nom}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      {trophee.date_remise ? new Date(trophee.date_remise).toLocaleDateString('fr-FR') : 'En cours'}
                    </td>
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

