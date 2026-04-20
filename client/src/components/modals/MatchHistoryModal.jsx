import React, { useState, useEffect } from 'react';
import { X, Calendar, Trophy, Loader2 } from 'lucide-react';
import { resultatAPI } from '@/api';

export default function MatchHistoryModal({ isOpen, onClose, clubId, competitionId, clubName }) {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && clubId && competitionId) {
      fetchHistory();
    }
  }, [isOpen, clubId, competitionId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await resultatAPI.getHistorique({ club_id: clubId, competition_id: competitionId });
      setMatchs(response.data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Parcours de {clubName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Historique des matchs de la compétition</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-slate-500">Chargement du palmarès...</p>
            </div>
          ) : matchs.length > 0 ? (
            <div className="space-y-4">
              {matchs.map((match) => {
                const isDom = match.club_domicile_nom === clubName;
                const isWin = isDom ? match.buts_domicile > match.buts_exterieur : match.buts_exterieur > match.buts_domicile;
                const isDraw = match.buts_domicile === match.buts_exterieur;

                return (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-100 hover:bg-primary-50/30 transition-all">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(match.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="font-semibold text-slate-700">
                        <span className={isDom ? "text-primary-600 font-bold" : ""}>{match.club_domicile_nom}</span>
                        <span className="mx-2 text-slate-300">vs</span>
                        <span className={!isDom ? "text-primary-600 font-bold" : ""}>{match.club_exterieur_nom}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg font-mono text-lg font-bold ${isWin ? 'bg-green-100 text-green-700' : isDraw ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                        {match.buts_domicile} - {match.buts_exterieur}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 italic">Aucun match validé trouvé pour cette compétition.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}