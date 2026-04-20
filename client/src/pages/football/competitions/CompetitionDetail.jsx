import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Calendar, Check, X, Plus, Award } from 'lucide-react';
import { competitionAPI, participationAPI, clubAPI } from '@/api';
import { useAuthStore } from '@/store';
import api from '@/api';
import { formatDate } from '@/utils';

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [competition, setCompetition] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClubInscris, setIsClubInscris] = useState(false);
  const [userClub, setUserClub] = useState(null);
  const [isLoadingInscription, setIsLoadingInscription] = useState(false);
  const [attributing, setAttributing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compRes = await competitionAPI.getById(id);
        setCompetition(compRes.data.data);
        const partRes = await participationAPI.getAll({ competition_id: id });
        setParticipations(partRes.data.data.participations || []);
        
        if (user && user.role === 'responsable_club' && user.club_id) {
          const userClubRes = await clubAPI.getById(user.club_id);
          setUserClub(userClubRes.data.data);
          
          const isInscris = (partRes.data.data.participations || partRes.data.data || []).some(p => p.club_id === parseInt(user.club_id));
          setIsClubInscris(isInscris);
        }
      } catch (error) {
        console.error('Error fetching competition:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const canEdit = ['super_admin', 'admin_sportif'].includes(user?.role);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétition?')) return;
    try {
      await competitionAPI.delete(id);
      navigate('/competitions');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const getTypeLabel = (type) => {
    const labels = { championnat: 'Championnat', coupe: 'Coupe', supercoupe: 'Supercoupe' };
    return labels[type] || type;
  };

  const handleClose = async () => {
    if (!confirm('Êtes-vous sûr de vouloir clôturer cette compétition?')) return;
    try {
      await competitionAPI.close(id);
      window.location.reload();
    } catch (error) {
      alert('Erreur lors de la clôture');
    }
  };

  const handleActivate = async () => {
    try {
      await competitionAPI.activate(id);
      window.location.reload();
    } catch (error) {
      alert("Erreur lors de l'activation");
    }
  };

  const handleAttribuerTrophee = async () => {
    if (!confirm('Attribuer le trophée de champion au club leader ?')) return;
    setAttributing(true);
    try {
      const response = await api.post(`/trophees/champion/${id}`);
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      alert('Erreur attribution: ' + (error.response?.data?.message || error.message));
    } finally {
      setAttributing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!competition) return <div className="p-8 text-center text-slate-500">Compétition non trouvée</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/competitions')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux compétitions
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600">{competition.nom_competition?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{competition.nom_competition}</h1>
              <p className="text-slate-500">{getTypeLabel(competition.type_competition)} - {competition.saison}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${competition.statut === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`} >
            {competition.statut === 'active' ? 'Active' : 'Clôturée'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Format</p>
            <p className="font-medium text-slate-900">{competition.format_competition || '-'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Nombre d'équipes</p>
            <p className="font-medium text-slate-900">{competition.nombre_equipes || '-'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Date de début</p>
            <p className="font-medium text-slate-900">{formatDate(competition.date_debut)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Date de fin</p>
            <p className="font-medium text-slate-900">{formatDate(competition.date_fin)}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            {competition.statut === 'active' ? (
              <button onClick={handleClose} className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg">
                Clôturer la compétition
              </button>
            ) : (
              <React.Fragment>
                <button onClick={handleActivate} className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg">
                  Activer la compétition
                </button>
                <button 
                  onClick={handleAttribuerTrophee}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all"
                  disabled={attributing}
                >
                  <Award className="w-4 h-4" />
                  {attributing ? 'Attribution...' : '🏆 Trophée Champion'}
                </button>
              </React.Fragment>
            )}
            <Link to={`/competitions/${id}/edit`} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
        {user?.role === 'responsable_club' && competition.statut === 'active' && !isClubInscris && userClub && (
          <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
            <button 
              onClick={async () => {
                if (!confirm(`Inscrire ${userClub.nom_club} à ${competition.nom_competition} ?`) ) return;
                setIsLoadingInscription(true);
                try {
                  await participationAPI.create({ competition_id: parseInt(id), club_id: user.club_id });
                  alert('Inscription envoyée! En attente de validation admin.');
                  window.location.reload();
                } catch (error) {
                  alert('Erreur inscription: ' + (error.response?.data?.message || error.message));
                } finally {
                  setIsLoadingInscription(false);
                }
              }} 
              disabled={isLoadingInscription}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isLoadingInscription ? 'Inscription...' : `Inscrire ${userClub.nom_club}`}
            </button>
          </div>
        )}
        {canEdit && competition.statut !== 'active' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-slate-900">🏆 Attribution Trophée Champion</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Le trophée de champion sera automatiquement attribué au club leader du classement final.
            </p>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
              * Nécessite classements calculés via matchs/résultats
            </div>
          </div>
        )}
        {user?.role === 'responsable_club' && competition.statut === 'active' && isClubInscris && userClub && (
          <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 bg-green-50 p-4 rounded-lg">
            <span className="text-green-800 font-medium flex items-center gap-2">
              ✅ {userClub.nom_club} inscrit (en attente validation)
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          Clubs Participants ({participations.length})
        </h2>
        {participations.length === 0 ? (
          <p className="text-slate-500">Aucun club inscrit</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participations.map((part) => (
              <div key={part.id} className="p-4 border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900">{part.nom_club}</p>
                <p className="text-sm text-slate-500">{part.sigle} - {part.ville}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  part.statut_validation === 'valide' ? 'bg-green-100 text-green-800' :
                  part.statut_validation === 'rejete' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {part.statut_validation === 'valide' ? 'Validé' :
                   part.statut_validation === 'rejete' ? 'Rejeté' : 'En attente'}
                </span>
                {['super_admin', 'admin_sportif'].includes(user?.role) && part.statut_validation === 'en_attente' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={async () => {
                      if (confirm('Valider cette inscription?')) {
                        try {
                          await participationAPI.validate(part.id);
                          window.location.reload();
                        } catch (error) {
                          alert('Erreur validation');
                        }
                      }
                    }} className="p-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={async () => {
                      if (confirm('Rejeter cette inscription?')) {
                        try {
                          await participationAPI.reject(part.id);
                          window.location.reload();
                        } catch (error) {
                          alert('Erreur rejet');
                        }
                      }
                    }} className="p-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
