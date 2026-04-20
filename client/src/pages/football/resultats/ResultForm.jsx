import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, User, Play, Clock } from 'lucide-react';
import api, { resultatAPI, matchAPI } from '@/api';
import toast from 'react-hot-toast';

export default function ResultForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    match_id: '',
    buts_domicile: 0,
    buts_exterieur: 0,
    observations: '',
    validation_officielle: false
  });
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buteurs, setButeurs] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState({ id: '', goals: 1 });
  const [currentMatch, setCurrentMatch] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Logique du chronomètre en direct
  useEffect(() => {
    let interval;
    if (currentMatch?.statut === 'en_cours' && currentMatch.date_match && currentMatch.heure_match) {
      const updateTimer = () => {
        const matchDateStr = currentMatch.date_match.includes('T') 
          ? currentMatch.date_match.split('T')[0] 
          : currentMatch.date_match;
        const startTime = new Date(`${matchDateStr} ${currentMatch.heure_match}`);
        const now = new Date();
        const diffSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
        setElapsedTime(diffSeconds);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [currentMatch?.statut, currentMatch?.date_match, currentMatch?.heure_match]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchMatchs = async () => {
      try {
        // On récupère tous les matchs récents pour permettre la saisie et l'édition
        const response = await matchAPI.getAll({ limit: 100 });
        const allMatchs = response.data.data.matchs || [];
        setMatchs(allMatchs);
      } catch (err) {
        console.error('Error fetching matchs:', err);
      }
    };
    fetchMatchs();

    if (isEdit) {
      const fetchResultat = async () => {
        try {
          const response = await resultatAPI.getById(id);
          setFormData(response.data.data);
        } catch (err) {
          setError('Erreur lors du chargement du résultat');
        }
      };
      fetchResultat();
    } else {
      const matchId = searchParams.get('match_id');
      if (matchId) {
        setFormData(prev => ({ ...prev, match_id: parseInt(matchId) }));
      }
    }
  }, [id, isEdit, searchParams]);

  // Charger les joueurs des deux clubs quand le match est sélectionné
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!formData.match_id || matchs.length === 0) return;
      const match = matchs.find(m => m.id === formData.match_id);
      if (!match) return;
      setCurrentMatch(match);

      try {
        const [domRes, extRes] = await Promise.all([
          api.get('/api/joueurs', { params: { club_id: match.club_domicile_id, limit: 50 } }),
          api.get('/api/joueurs', { params: { club_id: match.club_exterieur_id, limit: 50 } })
        ]);
        
        const players = [
          ...(domRes.data.data.joueurs || []).map(p => ({ ...p, club_nom: match.club_domicile_nom, side: 'domicile' })),
          ...(extRes.data.data.joueurs || []).map(p => ({ ...p, club_nom: match.club_exterieur_nom, side: 'exterieur' }))
        ];
        setAvailablePlayers(players);
      } catch (err) {
        console.error("Erreur lors de la récupération des joueurs:", err);
      }
    };

    fetchPlayers();
    // Réinitialiser les buteurs si on change de match en mode création
    if (!isEdit) setButeurs([]);
  }, [formData.match_id, matchs, isEdit]);

  const handleStartMatch = async () => {
    if (!formData.match_id) return;
    try {
      await api.put(`/api/matchs/${formData.match_id}`, { statut: 'en_cours' });
      toast.success("Match démarré !");
      setMatchs(matchs.map(m => m.id === formData.match_id ? { ...m, statut: 'en_cours' } : m));
    } catch (err) {
      toast.error("Erreur lors du démarrage du match");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const toastId = toast.loading(isEdit ? "Mise à jour du résultat..." : "Enregistrement du résultat...");

    try {
      let resultatId;

      // Étape A : Créer ou modifier le résultat (le score)
      if (isEdit) {
        await resultatAPI.update(id, formData);
        resultatId = id;
      } else {
        const response = await resultatAPI.create(formData);
        resultatId = response.data.data.id; // On récupère l'ID créé
      }

      // Étape B : Envoyer les buteurs
      if (resultatId && buteurs.length > 0) {
        try {
          await api.post(`/api/resultats/${resultatId}/buteurs`, { buteurs });
          toast.success("Résultat et buteurs enregistrés !", { id: toastId });
        } catch (errButeurs) {
          // Cas de succès partiel : le score est en DB, mais pas les buteurs
          toast.error(
            "Score enregistré, mais erreur lors de l'enregistrement des buteurs. Veuillez vérifier les statistiques.", 
            { id: toastId, duration: 6000 }
          );
        }
      } else {
        toast.success("Résultat enregistré avec succès !", { id: toastId });
      }

      navigate('/resultats');
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'enregistrement";
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const addButeur = () => {
    if (!selectedPlayer.id) return;
    const player = availablePlayers.find(p => p.id === parseInt(selectedPlayer.id));
    if (!player) return;

    const existing = buteurs.find(b => b.joueur_id === player.id);
    if (existing) {
      toast.error("Ce joueur est déjà dans la liste");
      return;
    }

    setButeurs([...buteurs, { 
      joueur_id: player.id, 
      nb_buts: selectedPlayer.goals, 
      nom: `${player.nom} ${player.postnom || ''}`,
      side: player.side 
    }]);

    // Mise à jour automatique du score selon le côté du joueur
    const scoreField = player.side === 'domicile' ? 'buts_domicile' : 'buts_exterieur';
    setFormData(prev => ({ ...prev, [scoreField]: prev[scoreField] + selectedPlayer.goals }));
    
    setSelectedPlayer({ id: '', goals: 1 });
  };

  const removeButeur = (joueurId, goals, side) => {
    setButeurs(buteurs.filter(b => b.joueur_id !== joueurId));
    const scoreField = side === 'domicile' ? 'buts_domicile' : 'buts_exterieur';
    setFormData(prev => ({ ...prev, [scoreField]: Math.max(0, prev[scoreField] - (goals || 0)) }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/resultats')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux résultats
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Modifier le résultat' : 'Nouveau résultat'}
          </h1>
          
          {formData.match_id && currentMatch?.statut === 'programme' && (
            <button
              type="button"
              onClick={handleStartMatch}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Démarrer le Match
            </button>
          )}
          
          {currentMatch?.statut === 'en_cours' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg font-mono text-lg font-bold shadow-inner">
                <Clock className="w-4 h-4 text-primary-400 animate-pulse" />
                {formatTime(elapsedTime)}
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full animate-pulse">
                EN COURS
              </span>
            </div>
          )}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Match *</label>
            <select
              required
              value={formData.match_id}
              onChange={(e) => setFormData({ ...formData, match_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={isEdit}
            >
              <option value="">Sélectionner un match</option>
              {matchs.map(match => (
                <option key={match.id} value={match.id}>
                  {match.club_domicile_nom} vs {match.club_exterieur_nom} - {match.nom_competition}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Buts équipe domicile</label>
              <input
                type="number"
                min="0"
                value={formData.buts_domicile}
                onChange={(e) => setFormData({ ...formData, buts_domicile: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Buts équipe extérieur</label>
              <input
                type="number"
                min="0"
                value={formData.buts_exterieur}
                onChange={(e) => setFormData({ ...formData, buts_exterieur: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
              <textarea
                rows={3}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ajouter des observations sur le match..."
              />
            </div>
          </div>

          {/* Section Buteurs */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              Buteurs du match
            </h3>

            {/* Liste des buteurs ajoutés */}
            <div className="space-y-2 mb-4">
              {buteurs.map((b) => (
                <div key={b.joueur_id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-700">{b.nom}</span>
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                      {b.nb_buts} but(s)
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeButeur(b.joueur_id, b.nb_buts, b.side)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulaire d'ajout rapide de buteur */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPlayer.id}
                onChange={(e) => setSelectedPlayer({ ...selectedPlayer, id: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={!formData.match_id}
              >
                <option value="">Sélectionner le buteur...</option>
                {availablePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} {p.postnom} ({p.club_nom})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={selectedPlayer.goals}
                onChange={(e) => setSelectedPlayer({ ...selectedPlayer, goals: parseInt(e.target.value) || 1 })}
                className="w-full sm:w-24 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addButeur}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/resultats')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}