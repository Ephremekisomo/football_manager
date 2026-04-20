import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Target, TrendingUp } from 'lucide-react';
import api, { matchAPI, resultatAPI } from '@/api';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';

export default function ClassementDetail() {
  const [teamMatches, setTeamMatches] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { equipe: teamName } = useParams();
  const { user } = useAuthStore();

  const competitionId = searchParams.get('competition_id');
  const saison = searchParams.get('saison') || '2026-2027';

  useEffect(() => {
    if (competitionId && teamName) {
      fetchTeamData();
    }
  }, [competitionId, teamName, saison]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Récup classement pour stats équipe
      const classementRes = await api.get('/classements', { 
        params: { competition_id: competitionId, saison } 
      });
      const standings = Array.isArray(classementRes.data.data) ? classementRes.data.data : [];
      const teamRow = standings.find(row => row.equipe.toLowerCase() === teamName.toLowerCase());
      setTeamStats(teamRow || {});

      if (teamRow?.club_id) {
        const resultsRes = await api.get('/resultats/historique', {
          params: { club_id: teamRow.club_id, competition_id: competitionId }
        });
        setTeamMatches(resultsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to={`/classements?competition_id=${competitionId}&saison=${saison}`} 
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au classement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{teamName}</h1>
            <p className="text-slate-500 mb-6">Statistiques détaillées - Saison {saison}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">{teamStats.points || 0}</div>
                <div className="text-sm text-slate-500">Points</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{teamStats.matchs_joues || 0}</div>
                <div className="text-sm text-slate-500">Matchs</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{teamStats.buts_pour || 0}</div>
                <div className="text-sm text-slate-500">Buts marqués</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className={`text-2xl font-bold ${teamStats.diff_buts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {teamStats.diff_buts >= 0 ? `+${teamStats.diff_buts}` : teamStats.diff_buts}
                </div>
                <div className="text-sm text-slate-500">Différence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matchs récents */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Matchs récents
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Match</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">Score</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-600">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Chargement...</td></tr>
              ) : teamMatches.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Aucun match trouvé</td></tr>
              ) : (
                teamMatches.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(match.date_match)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${match.club_domicile_nom === teamName ? 'text-primary-700' : 'text-slate-700'}`}>{match.club_domicile_nom}</span>
                        <span className="text-slate-400">vs</span>
                        <span className={`font-medium ${match.club_exterieur_nom === teamName ? 'text-primary-700' : 'text-slate-700'}`}>{match.club_exterieur_nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {match.buts_domicile} - {match.buts_exterieur}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const isDom = match.club_domicile_nom === teamName;
                        const myButs = isDom ? match.buts_domicile : match.buts_exterieur;
                        const oppButs = isDom ? match.buts_exterieur : match.buts_domicile;
                        const res = myButs > oppButs ? { l: 'V', c: 'bg-green-100 text-green-800' } : 
                                    myButs < oppButs ? { l: 'D', c: 'bg-red-100 text-red-800' } : 
                                    { l: 'N', c: 'bg-slate-100 text-slate-800' };
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${res.c}`}>
                            {res.l}
                          </span>
                        );
                      })()}
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
